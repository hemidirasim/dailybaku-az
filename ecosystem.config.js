module.exports = {
  apps: [{
    name: 'dailybaku',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/dailybaku.az/source',
    env: {
      NODE_ENV: 'production',
      PORT: 3063,
      HOSTNAME: 'localhost',
      DATABASE_URL: 'postgresql://dailybaku_user:RMSKSYcLqNzawhuNhP9Lf65PB@localhost:5432/dailybaku',
      NEXTAUTH_URL: 'https://dailybaku.az',
      NEXTAUTH_SECRET: 'DesT0nQ9OLveb92mBSb25j4nyadhfzJT',
      NEXT_PUBLIC_BASE_URL: 'https://dailybaku.az',
      NEXT_PUBLIC_SITE_URL: 'https://dailybaku.az',
      NEXT_PUBLIC_SITE_NAME: 'Daily Baku'
    },
    error_file: '/var/www/dailybaku.az/logs/pm2-error.log',
    out_file: '/var/www/dailybaku.az/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M'
  }]
};
