# OpenCode Mobile - Architecture

## Overview

OpenCode Mobile is a three-tier architecture that wraps the OpenCode CLI in a mobile-friendly interface:

```
┌─────────────────────────────────────────────────────────┐
│                     Mobile App Layer                     │
│                   (React Native/Expo)                    │
│                                                          │
│  - Chat UI                                               │
│  - Message rendering (Markdown)                          │
│  - Settings management                                   │
│  - Secure storage                                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS / WebSocket
                     │ via Cloudflare Tunnel
                     │
┌────────────────────▼────────────────────────────────────┐
│                   Bridge Server Layer                    │
│                    (Node.js/Express)                     │
│                                                          │
│  - REST API endpoints                                    │
│  - WebSocket server (streaming)                          │
│  - Request validation                                    │
│  - Process management                                    │
│  - Response formatting                                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Child process
                     │ (stdin/stdout)
                     │
┌────────────────────▼────────────────────────────────────┐
│                    OpenCode CLI Layer                    │
│                    (/snap/bin/opencode)                  │
│                                                          │
│  - AI provider integration                               │
│  - Code analysis                                         │
│  - Tool execution                                        │
│  - Session management                                    │
└─────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Mobile App (React Native/Expo)

**File:** `App.tsx`

**Responsibilities:**
- Render chat interface
- Handle user input
- Display messages with markdown formatting
- Manage local state (messages, settings)
- Persist configuration (server URL)
- Copy/paste functionality

**Key Technologies:**
- React Native 0.74
- Expo SDK 51
- React Native Paper (Material Design)
- React Native Markdown Display
- Expo SecureStore (config persistence)

**Communication:**
- HTTP POST to `/api/chat` for synchronous requests
- WebSocket to `/ws` for streaming responses (future)

### 2. Bridge Server (Node.js)

**File:** `server/bridge.js`

**Responsibilities:**
- Accept HTTP/WebSocket connections
- Spawn OpenCode CLI processes
- Stream responses back to clients
- Clean ANSI codes from terminal output
- Handle errors and timeouts
- Session management

**Key Features:**
- CORS enabled for cross-origin requests
- JSON request/response
- Timeout protection (120s default)
- Process cleanup
- Graceful shutdown

**API Endpoints:**

#### POST /api/chat
```json
Request:
{
  "message": "string",
  "history": [...],  // optional
  "model": "string", // optional
  "sessionId": "string" // optional
}

Response:
{
  "response": "string",
  "timestamp": "ISO-8601"
}
```

#### WebSocket /ws
```json
Send:
{
  "type": "chat",
  "message": "string",
  "model": "string"
}

Receive (streaming):
{
  "type": "chunk|complete|error",
  "content": "string"
}
```

#### GET /health
```json
Response:
{
  "status": "ok",
  "timestamp": "ISO-8601"
}
```

### 3. Cloudflare Tunnel

**Purpose:** Securely expose the local bridge server to the internet

**Benefits:**
- No port forwarding required
- Built-in DDoS protection
- SSL/TLS encryption
- Access control via Cloudflare dashboard
- Zero Trust security model

**Configuration:** `.cloudflared-opencode.yml`

### 4. OpenCode CLI

The actual AI coding assistant that:
- Connects to AI providers (Anthropic, OpenAI, etc.)
- Executes coding tasks
- Maintains conversation context
- Manages sessions

## Data Flow

### Typical Request Flow:

1. **User types message** in mobile app
2. **App sends HTTP POST** to `https://opencode.relayapp.pro/api/chat`
3. **Cloudflare Tunnel** routes to `localhost:7071`
4. **Bridge server receives** request, validates input
5. **Bridge spawns** OpenCode CLI process with message
6. **OpenCode CLI** processes request, calls AI provider
7. **OpenCode returns** response via stdout
8. **Bridge captures** output, cleans ANSI codes
9. **Bridge responds** with formatted JSON
10. **App receives** response, renders markdown

### Streaming Flow (WebSocket):

1. **App connects** WebSocket to `wss://opencode.relayapp.pro/ws`
2. **App sends** message via WebSocket
3. **Bridge spawns** OpenCode CLI process
4. **Bridge streams** stdout chunks back to app in real-time
5. **App renders** response progressively (chunk by chunk)
6. **Bridge sends** completion signal when done

## Security Considerations

### Current Implementation:
- ✅ SSL/TLS via Cloudflare
- ✅ CORS configuration
- ✅ Request timeout protection
- ✅ Process isolation (each request = new process)
- ✅ No direct port exposure

### Recommended Additions:
- 🔒 API key authentication
- 🔒 Rate limiting per client
- 🔒 Request size limits (already: 10mb)
- 🔒 IP allowlisting via Cloudflare
- 🔒 Input sanitization/validation
- 🔒 Audit logging

## Scalability

### Current Limitations:
- Single server (no load balancing)
- Process-per-request (no connection pooling)
- No caching layer
- Synchronous request processing

### Scaling Options:

**Vertical Scaling:**
- Add more CPU/RAM to server
- Use PM2 cluster mode
- Optimize OpenCode CLI startup

**Horizontal Scaling:**
- Multiple bridge servers behind load balancer
- Session affinity/sticky sessions
- Shared session store (Redis)
- Queue-based processing (Bull/BullMQ)

**Performance Optimizations:**
- Response caching (Redis)
- Keep-alive OpenCode processes
- Batch similar requests
- WebSocket connection pooling

## Monitoring

### Recommended Metrics:
- Request rate (requests/sec)
- Response time (p50, p95, p99)
- Error rate
- Active connections
- CPU/Memory usage
- OpenCode CLI process count

### Logging:
- Access logs (all requests)
- Error logs (failures)
- Application logs (important events)
- OpenCode CLI output (debug)

### Tools:
- PM2 for process monitoring
- Grafana for visualization
- Prometheus for metrics
- Loki for log aggregation
- Cloudflare Analytics

## Deployment

### Development:
```bash
./start-all.sh
```

### Production:
```bash
sudo ./install-services.sh
sudo systemctl start opencode-mobile
sudo systemctl start cloudflare-tunnel
```

### Updates:
```bash
cd ~/opencode-mobile
git pull
cd server && npm install
sudo systemctl restart opencode-mobile
```

## Future Enhancements

### Planned Features:
- [ ] Voice input/output
- [ ] Image upload support
- [ ] File attachment handling
- [ ] Session history sync
- [ ] Multi-user support
- [ ] Push notifications
- [ ] Offline mode with queue
- [ ] Advanced code editor
- [ ] Syntax highlighting improvements
- [ ] Dark/light/auto theme switching

### Technical Improvements:
- [ ] Add authentication layer
- [ ] Implement connection pooling
- [ ] Add response caching
- [ ] Better error handling
- [ ] Metrics/monitoring dashboard
- [ ] Automated testing suite
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] Kubernetes deployment option

## Development

### Local Testing:

1. Start bridge server:
```bash
cd server && npm start
```

2. Test API:
```bash
curl -X POST http://localhost:7071/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"hello"}'
```

3. Run mobile app:
```bash
npx expo start
```

### Debug Mode:

Set environment variables:
```bash
export DEBUG=true
export LOG_LEVEL=DEBUG
cd server && node bridge.js
```

### Hot Reload:

Use nodemon for server development:
```bash
cd server && npm run dev
```

Use Expo for mobile development:
```bash
npx expo start
```

## Troubleshooting

See [QUICKSTART.md](QUICKSTART.md) for common issues and solutions.

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT
