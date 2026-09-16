#!/usr/bin/env node

/**
 * OpenCode PWA Static Server
 * Serves the PWA files alongside the bridge server
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PWA_PORT || 8080;
const PWA_DIR = path.join(__dirname, '../pwa');

// Middleware
app.use(cors());
app.use(express.static(PWA_DIR));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(PWA_DIR, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 OpenCode PWA Server running on port ${PORT}`);
    console.log(`   Local: http://localhost:${PORT}`);
    console.log(`   Network: http://0.0.0.0:${PORT}`);
    console.log(`   PWA Directory: ${PWA_DIR}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing server');
    process.exit(0);
});
