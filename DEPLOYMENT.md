# 🚀 Deployment Guide

## Production Checklist

### Before Deployment

- [ ] Update environment variables
- [ ] Configure database for production
- [ ] Set strong JWT secret
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up error logging
- [ ] Configure file upload limits
- [ ] Review security settings
- [ ] Test all features
- [ ] Create database backups

### Backend Deployment

#### Option 1: Traditional Server (VPS)

1. **Prepare the server**
```bash
# Update system
sudo apt update && sudo apt upgrade

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install PM2 for process management
sudo npm install -g pm2
```

2. **Setup application**
```bash
# Clone repository
git clone your-repo-url
cd backend

# Install dependencies
npm install --production

# Build the application
npm run build

# Create .env for production
nano .env
```

3. **Configure PostgreSQL**
```bash
sudo -u postgres psql
CREATE DATABASE mommy_forum;
CREATE USER forum_user WITH ENCRYPTED PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE mommy_forum TO forum_user;
\q
```

4. **Start with PM2**
```bash
pm2 start dist/main.js --name mommy-forum-api
pm2 startup
pm2 save
```

5. **Setup Nginx reverse proxy**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Option 2: Heroku

1. Create `Procfile`:
```
web: node dist/main.js
```

2. Deploy:
```bash
heroku create mommy-forum-api
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

#### Option 3: Docker

1. Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

2. Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
      - DB_PORT=5432
    depends_on:
      - db
  
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: mommy_forum
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Frontend Deployment

#### Option 1: Static Hosting (Netlify/Vercel)

1. **Build for production**
```bash
cd frontend
npm run build
```

2. **Deploy to Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist/mommy-forum-frontend
```

3. **Configure redirects** (create `_redirects` in dist folder):
```
/*    /index.html   200
```

#### Option 2: Nginx Static Server

1. **Build**
```bash
npm run build
```

2. **Copy to server**
```bash
scp -r dist/* user@server:/var/www/mommy-forum
```

3. **Nginx configuration**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/mommy-forum;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Environment Variables (Production)

**Backend `.env`:**
```
NODE_ENV=production
PORT=3000
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=strong-password-here
DB_DATABASE=mommy_forum
JWT_SECRET=very-strong-random-secret-key-minimum-32-characters
JWT_EXPIRATION=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
MAX_FILE_SIZE=5242880
UPLOAD_PATH=/var/uploads
```

**Frontend `environment.prod.ts`:**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api',
};
```

### Database Migrations

For production, disable `synchronize` in TypeORM and use migrations:

1. **Generate migration**
```bash
npm run typeorm migration:generate -- -n InitialMigration
```

2. **Run migrations**
```bash
npm run typeorm migration:run
```

### Monitoring & Logging

1. **PM2 Monitoring**
```bash
pm2 monit
pm2 logs mommy-forum-api
```

2. **Setup log rotation**
```bash
pm2 install pm2-logrotate
```

3. **Error tracking** (optional - Sentry)
```bash
npm install @sentry/node
```

### Performance Optimization

1. **Enable compression**
```bash
npm install compression
```

```typescript
// main.ts
import * as compression from 'compression';
app.use(compression());
```

2. **Database indexing**
```typescript
@Index(['username'])
@Index(['email'])
@Entity()
export class User { ... }
```

3. **Caching** (optional - Redis)
```bash
npm install cache-manager cache-manager-redis-store
```

### Backup Strategy

1. **Database backups**
```bash
# Create backup script
pg_dump mommy_forum > backup_$(date +%Y%m%d).sql

# Setup cron job
0 2 * * * /path/to/backup-script.sh
```

2. **File uploads backup**
```bash
rsync -av /var/uploads/ /backup/uploads/
```

### Security Hardening

1. **Rate limiting**
```typescript
import { ThrottlerModule } from '@nestjs/throttler';

ThrottlerModule.forRoot({
  ttl: 60,
  limit: 10,
}),
```

2. **Helmet for security headers**
```bash
npm install helmet
```

```typescript
import helmet from 'helmet';
app.use(helmet());
```

3. **CORS configuration**
```typescript
app.enableCors({
  origin: ['https://yourdomain.com'],
  credentials: true,
});
```

### Post-Deployment

1. Test all endpoints
2. Verify real-time features work
3. Check file uploads
4. Test authentication flow
5. Monitor logs for errors
6. Set up uptime monitoring
7. Configure CDN for static assets (optional)

### Scaling Considerations

For high traffic:
- Use load balancer (Nginx/HAProxy)
- Database read replicas
- Redis for sessions/cache
- CDN for static files
- Horizontal scaling with PM2 cluster mode

```bash
pm2 start dist/main.js -i max --name mommy-forum-api
```

---

Your forum is now production-ready! 🚀👶
