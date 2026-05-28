#!/bin/bash
# LocalConnect — One-command dev startup
# Starts both server and client in the background

set -e

echo "=== LocalConnect Dev Startup ==="

# Install dependencies if needed
if [ ! -d "server/node_modules" ]; then
  echo "Installing server dependencies..."
  cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
  echo "Installing client dependencies..."
  cd client && npm install && cd ..
fi

# Initialize DB if needed
echo "Initializing database..."
cd server && npm run db:init 2>/dev/null || true && cd ..

# Start server in background
echo "Starting API server on port 3001..."
cd server && nohup npm run dev > /tmp/localconnect-server.log 2>&1 &
SERVER_PID=$!
cd ..

# Start client in background
echo "Starting frontend on port 5173..."
cd client && nohup npm run dev > /tmp/localconnect-client.log 2>&1 &
CLIENT_PID=$!
cd ..

echo "=== LocalConnect Running ==="
echo "  API Server:  http://localhost:3001"
echo "  API Health:  http://localhost:3001/api/health"
echo "  Frontend:    http://localhost:5173"
echo "  Server PID:  $SERVER_PID"
echo "  Client PID:  $CLIENT_PID"
echo ""
echo "Logs:"
echo "  tail -f /tmp/localconnect-server.log"
echo "  tail -f /tmp/localconnect-client.log"