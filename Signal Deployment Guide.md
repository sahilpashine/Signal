# Signal Deployment Guide

This guide covers deploying Signal to various hosting platforms.

## Prerequisites

- Node.js 22+
- MySQL/TiDB database
- Environment variables configured (see `.env.example`)

## Manus Hosting (Recommended)

Signal is built for Manus hosting with integrated OAuth, LLM, and S3 support.

### Steps

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Manus**
   - Go to Manus dashboard
   - Create new project from GitHub repository
   - Select `signal-gtm` repository

3. **Configure Environment**
   - Set all required environment variables in Manus dashboard
   - Database will be provisioned automatically

4. **Deploy**
   - Manus will automatically build and deploy on push to main branch

## Self-Hosted / Other Platforms

### Railway

1. **Connect Repository**
   - Go to railway.app
   - Create new project
   - Connect GitHub repository

2. **Add MySQL Plugin**
   - In Railway dashboard, add MySQL plugin
   - Copy connection string to `DATABASE_URL`

3. **Set Environment Variables**
   ```
   DATABASE_URL=<railway-mysql-url>
   JWT_SECRET=<generate-random-string>
   VITE_APP_ID=<your-oauth-app-id>
   # ... other variables
   ```

4. **Deploy**
   - Railway auto-deploys on push to main
   - Build command: `pnpm build`
   - Start command: `pnpm start`

### Vercel (Frontend Only)

For frontend-only deployment (requires separate backend):

1. **Deploy Frontend**
   ```bash
   vercel --prod
   ```

2. **Configure Backend URL**
   - Set `VITE_FRONTEND_FORGE_API_URL` to your backend URL

### Render

1. **Create New Web Service**
   - Go to render.com
   - Create new web service
   - Connect GitHub repository

2. **Configure Build & Start**
   - Build command: `pnpm install && pnpm build`
   - Start command: `pnpm start`
   - Environment: Node

3. **Add MySQL Database**
   - Create MySQL database in Render
   - Set `DATABASE_URL` environment variable

4. **Deploy**
   - Render auto-deploys on push

### Docker Deployment

1. **Build Docker Image**
   ```bash
   docker build -t signal-gtm:latest .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL="mysql://..." \
     -e JWT_SECRET="..." \
     # ... other env vars
     signal-gtm:latest
   ```

3. **Docker Compose**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         DATABASE_URL: mysql://user:password@db:3306/signal_gtm
         JWT_SECRET: your-secret
       depends_on:
         - db
     db:
       image: mysql:8.0
       environment:
         MYSQL_DATABASE: signal_gtm
         MYSQL_ROOT_PASSWORD: password
       volumes:
         - db_data:/var/lib/mysql
   volumes:
     db_data:
   ```

## Environment Variables Checklist

Before deploying, ensure these are set:

- [ ] `DATABASE_URL` — MySQL connection string
- [ ] `JWT_SECRET` — Random secret key (min 32 chars)
- [ ] `VITE_APP_ID` — OAuth app ID
- [ ] `OAUTH_SERVER_URL` — OAuth server URL
- [ ] `VITE_OAUTH_PORTAL_URL` — OAuth portal URL
- [ ] `BUILT_IN_FORGE_API_URL` — LLM API URL
- [ ] `BUILT_IN_FORGE_API_KEY` — LLM API key
- [ ] `VITE_FRONTEND_FORGE_API_URL` — Frontend API URL
- [ ] `VITE_FRONTEND_FORGE_API_KEY` — Frontend API key
- [ ] `OWNER_NAME` — Owner name
- [ ] `OWNER_OPEN_ID` — Owner OAuth ID

## Database Migrations

After deployment, run migrations:

```bash
pnpm drizzle-kit migrate
```

Or manually execute the SQL files in `drizzle/` directory.

## Health Checks

### Verify Deployment

1. **Frontend**
   ```bash
   curl https://your-domain.com/
   ```

2. **Backend**
   ```bash
   curl https://your-domain.com/api/trpc/auth.me
   ```

3. **Database**
   - Check connection in logs
   - Verify tables created

## Monitoring & Logs

### View Logs

**Manus**
```bash
manus logs signal-gtm
```

**Railway**
- Dashboard → Logs tab

**Render**
- Dashboard → Logs tab

**Docker**
```bash
docker logs <container-id>
```

### Common Issues

**Database Connection Error**
- Verify `DATABASE_URL` is correct
- Check database is running and accessible
- Ensure firewall allows connections

**LLM API Error**
- Verify `BUILT_IN_FORGE_API_KEY` is valid
- Check API endpoint is accessible
- Review LLM service status

**OAuth Redirect Error**
- Verify `VITE_OAUTH_PORTAL_URL` matches OAuth config
- Check redirect URLs in OAuth app settings
- Ensure HTTPS is enforced

## Performance Optimization

### Database
```sql
-- Add indexes for common queries
CREATE INDEX idx_user_id ON gtm_briefs(userId);
CREATE INDEX idx_share_token ON gtm_briefs(shareToken);
CREATE INDEX idx_created_at ON gtm_briefs(createdAt DESC);
```

### CDN
- Use CloudFront for S3 PDFs
- Enable gzip compression
- Set cache headers appropriately

### Application
- Enable HTTP/2
- Use connection pooling for database
- Implement rate limiting on LLM endpoint

## Backup & Recovery

### Database Backup

**MySQL**
```bash
mysqldump -u user -p database_name > backup.sql
```

**Restore**
```bash
mysql -u user -p database_name < backup.sql
```

### S3 Backup
- Enable versioning on S3 bucket
- Set lifecycle policies for old versions
- Use cross-region replication

## Scaling

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Run multiple app instances
- Use managed database (RDS, TiDB Cloud)

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries
- Cache frequently accessed data

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables not in code
- [ ] Database credentials secured
- [ ] S3 bucket not publicly readable
- [ ] OAuth secrets protected
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] SQL injection prevention (Drizzle ORM)
- [ ] XSS prevention (React escaping)
- [ ] CSRF protection (session cookies)

## Rollback

If deployment fails:

1. **Check Logs** — Identify error
2. **Rollback** — Revert to previous version
3. **Fix Issue** — Update code
4. **Redeploy** — Push fix and redeploy

## Support

For deployment issues:
1. Check platform documentation
2. Review application logs
3. Verify environment variables
4. Open GitHub issue with error details
