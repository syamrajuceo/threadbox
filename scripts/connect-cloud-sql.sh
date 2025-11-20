#!/bin/bash

# Script to connect to Cloud SQL using Cloud SQL Proxy
# This bypasses IPv6 issues by using the proxy

PROJECT_ID="threadbox-production"
INSTANCE_NAME="threadbox-db"
CONNECTION_NAME="threadbox-production:us-central1:threadbox-db"
LOCAL_PORT=5433

echo "🔌 Starting Cloud SQL Proxy..."
echo "   Connection: $CONNECTION_NAME"
echo "   Local port: $LOCAL_PORT"
echo ""
echo "   The proxy will run in the background."
echo "   Press Ctrl+C to stop it when done."
echo ""

# Start Cloud SQL Proxy in background
cloud-sql-proxy --port=$LOCAL_PORT $CONNECTION_NAME &
PROXY_PID=$!

# Wait for proxy to start
sleep 3

echo "✅ Proxy started (PID: $PROXY_PID)"
echo ""
echo "📝 Now you can connect using:"
echo "   psql -h 127.0.0.1 -p $LOCAL_PORT -U postgres -d postgres"
echo ""
echo "   Or run the setup script:"
echo "   PGPASSWORD='fNoidykRznLb71o7s8qVUCV23' psql -h 127.0.0.1 -p $LOCAL_PORT -U postgres -d postgres -f scripts/init-db.sql"
echo ""
echo "   When done, stop the proxy with: kill $PROXY_PID"
echo ""

# Keep script running
wait $PROXY_PID

