#!/usr/bin/env bash
# exit on error
set -o errexit

echo "--- Installing Python backend dependencies ---"
pip install -r backend/requirements.txt

echo "--- Building frontend ---"
cd frontend
npm install
npm run build
cd ..

echo "--- Render build complete! ---"
