#!/bin/bash

echo "🚀 Starting SmartReportAI Simple Vision Service..."

# Navigate to python service directory
cd "$(dirname "$0")"

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install simple dependencies only
echo "📋 Installing simple dependencies..."
pip install -r requirements-simple.txt

# Start the simple service
echo "🌟 Starting Simple AI service on http://localhost:8000"
echo "📊 API documentation: http://localhost:8000/docs"
python main-simple.py