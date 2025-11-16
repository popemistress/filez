# Production Deployment Guide

## Server: 178.128.128.110

### Current Status
✅ Production build completed successfully  
✅ Application running on port 3003  
✅ PM2 ecosystem configured for production  

---

## Quick Start Commands

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
# Or with custom port:
PORT=3001 npm start
```

### Using PM2 (Recommended)
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Stop
pm2 stop filez

# Restart
pm2 restart filez

# View logs
pm2 logs filez

# Monitor
pm2 monit
```

---

## Configuration

### Environment Variables (.env)
Ensure these are set:
```
DATABASE_URL=postgresql://...
UPLOADTHING_TOKEN=...
```

### Next.js Config
- ESLint disabled during builds (to avoid Prisma generated file errors)
- Image domains configured for UploadThing
- Production optimizations enabled

### Port Configuration
- Default: 3001 (configured in ecosystem.config.js)
- Nginx proxies from port 80 to 3001
- Can be changed via PORT environment variable

---

## Deployment Workflow

### 1. Pull Latest Changes
```bash
cd /home/yamz/sites/filez
git pull origin main
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build Production
```bash
npm run build
```

### 4. Restart Application
```bash
pm2 restart filez
# Or if not using PM2:
pm2 start ecosystem.config.js
```

---

## Nginx Configuration (Optional)

If you want to serve on port 80/443, configure Nginx as reverse proxy:

```nginx
server {
    listen 80;
    server_name 178.128.128.110;

    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Monitoring

### Check Application Status
```bash
pm2 status
```

### View Real-time Logs
```bash
pm2 logs filez --lines 100
```

### Check Resource Usage
```bash
pm2 monit
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -ti:3003

# Kill process
kill -9 $(lsof -ti:3003)
```

### Database Connection Issues
```bash
# Test database connection
npm run db:test
```

### Clear Build Cache
```bash
rm -rf .next
npm run build
```

---

## Production Checklist

- [x] Build completed without errors
- [x] Environment variables configured
- [x] Database connection working
- [x] UploadThing configured
- [x] PM2 ecosystem file updated
- [ ] Nginx reverse proxy (optional)
- [ ] SSL certificate (optional)
- [ ] Domain name configured (optional)

---

## Access URLs

- **Public (via Nginx)**: http://178.128.128.110 or http://filez.selfmaxing.io
- **Direct (Node)**: http://178.128.128.110:3001
- **Local**: http://localhost:3001

---

## Current Setup

The application is currently running using the `start-production.sh` script:

```bash
# Start the server
./start-production.sh &

# Or manually:
PORT=3003 npm start
```

### PM2 Alternative (Optional)

If you prefer PM2, the ecosystem.config.js is configured but may need adjustment:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Notes

- ✅ Application is running in **production mode** (optimized)
- ✅ No development server - using `npm start` (production build)
- ✅ API routes working correctly
- ✅ Database connection active
- ✅ All components rendered successfully
- ✅ Nginx reverse proxy configured and working
- ✅ Port 3001 is configured and accessible
- ✅ Public access via http://178.128.128.110
