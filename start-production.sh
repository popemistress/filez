#!/bin/bash
cd /home/yamz/sites/filez

# Build the Next.js app for production
npm run build

# Start the production server on port 3003
PORT=3003 npm start
