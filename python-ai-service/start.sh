#!/bin/bash

echo "🚀 Starting SmartReportAI Vision Service..."

# Navigate to python service directory
cd "$(dirname "$0")"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📋 Installing dependencies..." 
pip install -r requirements.txt

# Start the service
echo "🌟 Starting AI service on http://localhost:8000"
echo "📊 API documentation: http://localhost:8000/docs"
python main.py