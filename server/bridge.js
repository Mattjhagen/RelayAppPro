#!/usr/bin/env node

/**
 * OpenCode Bridge Server
 * Connects mobile app to OpenCode CLI via WebSocket/HTTP
 */

const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const { WebSocket, WebSocketServer } = require('ws');
const http = require('http');
const { execSync } = require('child_process');

const app = express();
const PORT = process.env.PORT || 7072;

// Auto-detect OpenCode path
let OPENCODE_PATH = process.env.OPENCODE_PATH;
if (!OPENCODE_PATH) {
    try {
        // Try to find opencode in PATH
        OPENCODE_PATH = execSync('which opencode', { encoding: 'utf8' }).trim();
        console.log('✅ OpenCode found at:', OPENCODE_PATH);
    } catch (e) {
        // Fallback paths
        const possiblePaths = [
            '/snap/bin/opencode',           // Linux snap
            '/usr/local/bin/opencode',      // Mac Intel Homebrew
            '/opt/homebrew/bin/opencode',   // Mac Apple Silicon Homebrew
            'opencode',                      // In PATH
        ];

        for (const path of possiblePaths) {
            try {
                execSync(`${path} --version`, { stdio: 'ignore' });
                OPENCODE_PATH = path;
                console.log('✅ OpenCode found at:', path);
                break;
            } catch (e) {
                // Try next path
            }
        }

        if (!OPENCODE_PATH) {
            console.error('❌ OpenCode not found. Please install opencode and ensure it\'s in your PATH.');
            console.error('   Mac: brew install anomalyco/tap/opencode');
            console.error('   Linux: snap install opencode');
            process.exit(1);
        }
    }
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session management
const sessions = new Map();

// Create HTTP server
const server = http.createServer(app);

// WebSocket server for real-time streaming
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'chat') {
        await handleChatViaWebSocket(ws, data);
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message,
      }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API endpoint for chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], model, sessionId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Received message:', message.substring(0, 100));

    // Run opencode with the message
    const response = await runOpenCode(message, {
      model,
      sessionId,
      history,
    });

    res.json({
      response: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({
      error: 'Failed to process message',
      details: error.message,
    });
  }
});

// Run OpenCode CLI
async function runOpenCode(message, options = {}) {
  return new Promise((resolve, reject) => {
    const args = ['run'];

    // Add model if specified
    if (options.model) {
      args.push('-m', options.model);
    }

    // Add session continuation if specified
    if (options.sessionId) {
      args.push('--session', options.sessionId);
    }

    // Add the message
    args.push(message);

    console.log('Running opencode:', args.join(' '));

    const opencode = spawn(OPENCODE_PATH, args, {
      env: {
        ...process.env,
        TERM: 'xterm-256color',
        FORCE_COLOR: '0', // Disable color codes
      },
    });

    let output = '';
    let errorOutput = '';

    opencode.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      console.log('OpenCode output:', chunk.substring(0, 200));
    });

    opencode.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error('OpenCode stderr:', data.toString());
    });

    opencode.on('close', (code) => {
      if (code === 0 || output.length > 0) {
        // Clean up the output
        const cleaned = cleanOutput(output);
        resolve(cleaned || 'Response received but no content available.');
      } else {
        reject(new Error(errorOutput || `OpenCode exited with code ${code}`));
      }
    });

    opencode.on('error', (err) => {
      reject(new Error(`Failed to start opencode: ${err.message}`));
    });

    // Timeout after 5 minutes (300 seconds)
    // OpenCode can take a long time, especially on first run
    setTimeout(() => {
      opencode.kill();
      reject(new Error('Request timeout - OpenCode took longer than 5 minutes'));
    }, 300000);
  });
}

// Clean ANSI codes and format output
function cleanOutput(text) {
  return text
    // Remove ANSI escape codes
    .replace(/\x1b\[[0-9;]*m/g, '')
    // Remove control characters
    .replace(/\x1b\[[\d;]*[a-zA-Z]/g, '')
    // Remove progress bars and spinners
    .replace(/[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/g, '')
    // Clean up excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// WebSocket handler for streaming responses
async function handleChatViaWebSocket(ws, data) {
  const { message, history = [], model, sessionId } = data;

  ws.send(JSON.stringify({ type: 'status', status: 'processing' }));

  try {
    const args = ['run'];

    if (model) args.push('-m', model);
    if (sessionId) args.push('--session', sessionId);
    args.push(message);

    const opencode = spawn(OPENCODE_PATH, args, {
      env: {
        ...process.env,
        TERM: 'xterm-256color',
        FORCE_COLOR: '0',
      },
    });

    let buffer = '';

    opencode.stdout.on('data', (data) => {
      buffer += data.toString();
      const cleaned = cleanOutput(buffer);

      ws.send(JSON.stringify({
        type: 'chunk',
        content: cleaned,
      }));
    });

    opencode.on('close', (code) => {
      ws.send(JSON.stringify({
        type: 'complete',
        content: cleanOutput(buffer),
      }));
    });

    opencode.on('error', (err) => {
      ws.send(JSON.stringify({
        type: 'error',
        error: err.message,
      }));
    });
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'error',
      error: error.message,
    }));
  }
}

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 OpenCode Bridge Server running on port ${PORT}`);
  console.log(`   HTTP: http://localhost:${PORT}`);
  console.log(`   WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
