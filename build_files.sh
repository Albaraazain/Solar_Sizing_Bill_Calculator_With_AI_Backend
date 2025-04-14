#!/bin/bash

# Build the project
pip install -r requirements.txt

# Make migrations
python manage.py makemigrations
python manage.py migrate

# Collect static files
mkdir -p staticfiles_build
python manage.py collectstatic --no-input
cp -r static staticfiles_build/