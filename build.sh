#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status.

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Applying database migrations..."
python manage.py migrate --noinput

echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Deployment build complete!" 