# WebSocket Production Fix Guide

## Issues Identified

1. **Nginx WebSocket Proxy Configuration**: Missing timeout settings and WebSocket-specific headers
2. **Gunicorn Configuration**: Using multiple workers which can cause WebSocket state issues
3. **Environment Configuration**: WebSocket URLs not properly configured for production
4. **Connection Management**: No heartbeat mechanism for connection health monitoring

## Solutions Applied

### 1. Updated Nginx Configuration (`nginx/default-pro.conf`)
- Added WebSocket-specific timeout settings
- Added proper proxy buffering and caching settings
- Added WebSocket protocol headers
- Increased connection timeouts for long-lived connections

### 2. Updated Docker Compose Production (`docker-compose.prod.yml`)
- Reduced Gunicorn workers to 1 (WebSockets work better with single worker)
- Added WebSocket-specific Gunicorn settings
- Added connection limits and timeouts

### 3. Enhanced WebSocket Service (`src/services/websocketService.js`)
- Added automatic protocol detection (ws/wss)
- Added connection timeout handling
- Added heartbeat mechanism for connection health
- Improved reconnection logic with exponential backoff
- Added better error handling and logging

## Deployment Steps

### 1. Environment Variables
Create `.env.prod` file with:
```bash
# WebSocket Configuration
WS_URL=wss://api.aetherium.wiki

# Other production variables...
```

### 2. Frontend Environment
Create `FrontEnd/aetherium/.env.production`:
```bash
VITE_API_BASE_URL=https://api.aetherium.wiki
VITE_WS_URL=wss://api.aetherium.wiki
```

### 3. Deploy Changes
```bash
# Rebuild and restart services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### 4. Verify WebSocket Connection
1. Open browser developer tools
2. Check console for WebSocket connection logs
3. Test real-time messaging functionality
4. Monitor connection stability over time

## Additional Recommendations

### 1. Load Balancer Configuration
If using a load balancer, ensure it supports WebSocket connections:
- Enable sticky sessions
- Configure WebSocket passthrough
- Set appropriate timeouts

### 2. Monitoring
Add monitoring for:
- WebSocket connection counts
- Connection drop rates
- Message delivery success rates
- Reconnection attempts

### 3. SSL Certificate
Ensure SSL certificate is valid and includes WebSocket subdomain:
```bash
# Check certificate
openssl s_client -connect api.aetherium.wiki:443 -servername api.aetherium.wiki
```

## Testing

### 1. Connection Test
```javascript
// Test WebSocket connection in browser console
const ws = new WebSocket('wss://api.aetherium.wiki/ws/test-user');
ws.onopen = () => console.log('Connected');
ws.onmessage = (e) => console.log('Message:', e.data);
ws.onclose = (e) => console.log('Disconnected:', e.code, e.reason);
```

### 2. Production Monitoring
Monitor these metrics:
- WebSocket connection success rate
- Message delivery latency
- Connection drop frequency
- Reconnection success rate

## Troubleshooting

### Common Issues:
1. **Connection Refused**: Check nginx configuration and SSL certificates
2. **Intermittent Disconnections**: Check heartbeat mechanism and timeout settings
3. **Messages Not Delivered**: Check WebSocket state and reconnection logic
4. **SSL Errors**: Verify certificate validity and WebSocket protocol support

### Debug Commands:
```bash
# Check nginx configuration
nginx -t

# Check WebSocket connections
netstat -an | grep :443

# Monitor logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```
