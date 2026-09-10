#!/bin/bash

echo "Setting up Rural-Nex Local Environment..."

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "Python3 is not installed or not in PATH. Please install Python 3.10+."
    exit 1
fi

# Create Virtual Environment if it doesn't exist
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv backend/venv
fi

# Activate Virtual Environment and install requirements
echo "Activating virtual environment and installing dependencies..."
source backend/venv/bin/activate
pip install -r backend/requirements.txt

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed or not in PATH. Please install Node.js 18+."
    exit 1
fi

# Install Frontend Dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "Setup complete!"
echo "Note: Native backend execution requires GDAL/GEOS libraries installed and configured."
echo "If they are not configured, please use Docker for execution."
