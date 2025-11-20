module.exports = {
  apps: [{
    name: 'filez',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/home/yamz/sites/filez',
    exec_mode: 'fork',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '800M',
    node_args: '--max-old-space-size=600',
    
    // Enhanced restart settings for maximum reliability
    restart_delay: 4000,        // Wait 4 seconds before restart
    max_restarts: 50,           // Allow up to 50 restarts
    min_uptime: '10s',          // Minimum uptime before considering stable
    
    // Monitoring and health checks
    listen_timeout: 8000,       // Wait 8 seconds for app to start
    kill_timeout: 5000,         // Wait 5 seconds before force kill
    
    // Exponential backoff for unstable restarts
    exp_backoff_restart_delay: 100,
    
    // Logging
    error_file: '/home/yamz/sites/filez/logs/pm2-error.log',
    out_file: '/home/yamz/sites/filez/logs/pm2-out.log',
    log_file: '/home/yamz/sites/filez/logs/pm2-combined.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    env: {
      NODE_ENV: 'production',
      PORT: 3003,
      HOST: '178.128.128.110',
      NODE_OPTIONS: '--max-old-space-size=600'
    }
  }]
};
