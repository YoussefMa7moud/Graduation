#!/bin/bash

# Start OCL API Server
# This script ensures dependencies are installed and starts the server on port 5001

echo "Starting OCL API Server..."

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo "Warning: No virtual environment detected."
    echo "It's recommended to use a virtual environment."
    echo ""
fi

# Check if groq is installed
python3 -c "import groq" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Installing required dependencies..."
    pip install groq python-dotenv fastapi uvicorn
fi

# Start the server
echo "Starting server on http://0.0.0.0:5001"
uvicorn api_server:app --host 0.0.0.0 --port 5001 --reload
