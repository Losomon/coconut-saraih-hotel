/**
 * PM2 Ecosystem Configuration
 * For production deployment
 */

module.exports = {
  apps: [
    {
      // Main API Application
      name: 'coconut-saraih-api',
      script: './server.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      kill_timeout: 5000,
      listen_timeout: 8000,
      wait_ready: true,
      instance_var: 'INSTANCE_ID',
      merge_logs: true,
      // Security
      secure_variables: [
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'ENCRYPTION_KEY',
        'MONGODB_URI',
        'REDIS_URL',
        'EMAIL_PASS',
        'STRIPE_SECRET_KEY',
        'TWILIO_AUTH_TOKEN',
        'CLOUDINARY_API_SECRET'
      ],
      // Deploy configuration
      deploy: {
        production: {
          user: 'node',
          host: 'your-server-ip',
          ref: 'origin/main',
          repo: 'git@github.com:your-repo/coconut-saraih-backend.git',
          path: '/var/www/coconut-saraih',
          'pre-deploy-local': '',
          'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
          'pre-setup': ''
        },
        staging: {
          user: 'node',
          host: 'your-staging-server-ip',
          ref: 'origin/develop',
          repo: 'git@github.com:your-repo/coconut-saraih-backend.git',
          path: '/var/www/coconut-saraih-staging',
          'pre-deploy-local': '',
          'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env staging',
          'pre-setup': ''
        }
      }
    },
    // Worker for background jobs (optional)
    {
      name: 'coconut-saraih-worker',
      script: './jobs/worker.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      error_file: './logs/worker-error.log',
      out_file: './logs/worker-out.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      cron_restart: '0 4 * * *', // Restart daily at 4 AM
      wait_ready: false
    }
  ],
  
  // PM2 Plus / PM2 Enterprise configuration
  pmx: {
    enable: true,
    tracing: true,
    metrics: {
      provider: {
        moduleName: '@newrelic/performance-rotation'
      }
    },
    actions: {
      prof: false
    },
    events: {
      enabled: true,
      config: {
        maxHistory: 30,
        retention: 30,
        emitCloning: true,
        emitError: true
      }
    }
  }
};
