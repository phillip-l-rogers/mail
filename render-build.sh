#!/usr/bin/env bash

# Exit on error
set -o errexit

# Install Python dependencies (Render does this, but it's good for clarity)
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput
