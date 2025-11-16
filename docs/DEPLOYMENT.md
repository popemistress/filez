# Deployment Information

## 🚀 Application Status

**Status:** ✅ Running  
**PM2 Service:** filez  
**Port:** 3001  
**Environment:** Development

## 🌐 Access URLs

### Via IP Address
- **HTTP:** http://178.128.128.110

### Via Domain (if DNS configured)
- **HTTP:** http://filez.selfmaxing.io

## 📋 PM2 Commands

### View Status
```bash
pm2 list
pm2 describe filez
```

### View Logs
```bash
pm2 logs filez
pm2 logs filez --lines 100
```

### Restart/Stop/Start
```bash
pm2 restart filez
pm2 stop filez
pm2 start filez
```

### Monitor
```bash
pm2 monit
```

### Save PM2 Configuration
```bash
pm2 save
```

## 🔧 Nginx Configuration

**Config File:** `/etc/nginx/sites-available/filez`  
**Symlink:** `/etc/nginx/sites-enabled/filez`

### Reload Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### View Nginx Logs
```bash
sudo tail -f /var/log/nginx/filez-access.log
sudo tail -f /var/log/nginx/filez-error.log
```

## 📦 Database Information

**Database:** fileupload  
**User:** kan_user  
**Host:** localhost:5432  
**Type:** PostgreSQL 17.6

### Database Commands
```bash
# Test connection
npm run db:test

# Initialize schema
npm run db:init

# Connect to database
PGPASSWORD=kan_secure_password_2024 psql -U kan_user -h localhost -d fileupload
```

## 🔐 Environment Variables

Located in: `/home/yamz/sites/filez/.env`

```env
UPLOADTHING_TOKEN=<configured>
DATABASE_URL=postgresql://kan_user:kan_secure_password_2024@localhost:5432/fileupload
```

## 📁 Important Files

- **PM2 Config:** `ecosystem.config.js`
- **Nginx Config:** `/etc/nginx/sites-available/filez`
- **Database Schema:** `db/schema.sql`
- **Environment:** `.env`

## 🔄 Deployment Workflow

### Update Application
```bash
cd /home/yamz/sites/filez
git pull  # if using git
npm install  # if dependencies changed
pm2 restart filez
```

### Update Nginx Config
```bash
sudo nano /etc/nginx/sites-available/filez
sudo nginx -t
sudo systemctl reload nginx
```

## 🛡️ SSL/HTTPS Setup (Optional)

To enable HTTPS with Let's Encrypt:

```bash
# Install certbot if not already installed
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate (requires domain DNS to be configured)
sudo certbot --nginx -d filez.selfmaxing.io

# Auto-renewal is configured by certbot
```

## 📊 File Upload Limits

- **Nginx:** 1GB (configured in nginx config)
- **UploadThing Images:** 4MB max
- **UploadThing Videos:** 1GB max

## 🐛 Troubleshooting

### Application not responding
```bash
pm2 restart filez
pm2 logs filez --err
```

### Database connection issues
```bash
npm run db:test
sudo systemctl status postgresql
```

### Nginx issues
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/filez-error.log
```

### Port already in use
```bash
sudo lsof -i :3001
pm2 delete filez
pm2 start ecosystem.config.js
```

## 📝 Notes

- The application runs in development mode with hot-reload
- PM2 will auto-restart the application if it crashes
- Logs are stored in `~/.pm2/logs/`
- For production, consider building with `npm run build` and using `npm start`
