#!/bin/bash
echo "Starting local server at http://localhost:8000"
echo "Opening Admin Login..."
open http://localhost:8000/admin/login.html
python3 -m http.server 8000
