#!/bin/bash

# Set testing mode environment variables
export NODE_ENV=development
export TESTING_MODE=true
export SKIP_CAMERA=true

echo "🧪 Starting Spotify Controller in TESTING MODE"
echo "   - Camera interactions disabled"
echo "   - Longer polling intervals"
echo "   - Testing tips enabled"
echo ""

# Start the app
npm start