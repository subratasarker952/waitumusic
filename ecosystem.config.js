module.exports = {
  apps: [{
    name: 'waitumusic-production',
    script: 'tsx',
    args: 'server/index.ts',
    cwd: '/opt/waitumusic',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0'
    },
    max_memory_restart: '1G',
    error_file: '/var/log/waitumusic/error.log',
    out_file: '/var/log/waitumusic/out.log',
    log_file: '/var/log/waitumusic/combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_restarts: 5,
    min_uptime: '10s',
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};