module.exports = {
  apps: [{
    name: 'filez',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/home/yamz/sites/filez',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3003
    }
  }]
};
