module.exports = {
  apps: [{
    name: 'filez',
    script: 'npm',
    args: 'run dev',
    cwd: '/home/yamz/sites/filez',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    }
  }]
};
