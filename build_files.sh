#!/bin/bash

echo "Building the project..."
# Build the project using the correct path to pip
python -m pip install -r requirements.txt

echo "Running migrations..."
# Make migrations with explicit python path
python manage.py makemigrations
python manage.py migrate

echo "Collecting static files..."
# Create directory and collect static files
mkdir -p staticfiles_build
python manage.py collectstatic --no-input

# Only try to copy static directory if it exists
if [ -d "static" ]; then
    echo "Copying static directory..."
    cp -r static staticfiles_build/
else
    echo "No static directory found, creating empty one..."
    mkdir -p staticfiles_build/static
fi

echo "Build process completed."