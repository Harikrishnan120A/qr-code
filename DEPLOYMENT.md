# 🚀 Lab Login System - Deployment Guide

This comprehensive guide provides multiple deployment options for the Lab Login System, from local production builds to cloud platforms.

## 📋 Pre-Deployment Checklist

- [ ] Node.js 18+ installed
- [ ] npm/yarn package manager
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Admin secret updated for production
- [ ] Domain/hosting platform chosen

## 🏗️ Quick Deployment

### Option 1: Automated Script (Recommended)

**Windows:**
```cmd
deploy.bat
```

**Linux/macOS:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Build

```bash
# Server build
cd lab-login-app/server
npm ci --only=production
npx prisma generate
npm run build

# Client build  
cd ../client
npm ci --only=production
npm run build
```

## 🌐 Deployment Platforms

### 1. 🐳 Docker Deployment

**Build and run with Docker:**
```bash
# Build image
docker build -t lab-login-app .

# Run container
docker run -p 4000:4000 -e ADMIN_SECRET=your-secret lab-login-app

# Or use Docker Compose
docker-compose up -d
```

**Environment variables for Docker:**
```env
NODE_ENV=production
PORT=4000
ADMIN_SECRET=your-secure-secret
DATABASE_URL=file:./prisma/production.db
```

### 2. 🚂 Railway Deployment

**Deploy to Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up
```

**Railway configuration:**
- Uses `railway.toml` for build settings
- Set environment variables in Railway dashboard
- Automatic HTTPS and custom domains
- SQLite database with persistent volumes

### 3. ▲ Vercel Deployment

**Deploy to Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Vercel features:**
- Serverless functions for API
- Static hosting for React frontend
- Automatic HTTPS and CDN
- Custom domains and redirects

### 4. 🎨 Render Deployment

**Deploy to Render:**
1. Connect GitHub repository
2. Use `render.yaml` configuration
3. Set environment variables in dashboard
4. Deploy with automatic builds

**Render features:**
- Free tier available
- Automatic SSL certificates
- PostgreSQL database option
- Health checks and monitoring

### 5. 🟣 Heroku Deployment

**Deploy to Heroku:**
```bash
# Install Heroku CLI
npm install -g heroku

# Create app and deploy
heroku create your-app-name
git push heroku master
```

**Required files for Heroku:**
- `Procfile`: `web: cd lab-login-app/server && npm start`
- Set environment variables via CLI or dashboard

### 6. 📦 Manual VPS Deployment

**For Ubuntu/Debian servers:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and build
git clone your-repo
cd qr-code
chmod +x deploy.sh
./deploy.sh

# Set up PM2 for process management
sudo npm install -g pm2
pm2 start lab-login-app/server/dist/index.js --name lab-login
pm2 startup
pm2 save
```

## 🔧 Environment Configuration

### Production Environment Variables

Create `lab-login-app/.env.production`:

```env
# Server Configuration
NODE_ENV=production
PORT=4000
HOST=yourdomain.com:4000

# Security (CHANGE THIS!)
ADMIN_SECRET=your-very-secure-secret-here

# Database
DATABASE_URL="file:./prisma/production.db"

# Optional: PostgreSQL for production
# DATABASE_URL="postgresql://user:password@localhost:5432/lablogin"
```

### Platform-Specific Settings

**Railway:**
```env
HOST=${{RAILWAY_STATIC_URL}}
DATABASE_URL=${{DATABASE_URL}}
```

**Vercel:**
```env
HOST=${{VERCEL_URL}}
```

**Render:**
```env
HOST=${{RENDER_EXTERNAL_URL}}
```

## 🗄️ Database Options

### 1. SQLite (Default)
- Best for: Small to medium applications
- Setup: No additional configuration needed
- Pros: Simple, no external dependencies
- Cons: Single file, limited concurrent writes

### 2. PostgreSQL (Recommended for Production)
- Best for: Production applications
- Setup: Update `DATABASE_URL` in environment
- Pros: Robust, scalable, ACID compliant
- Cons: Requires separate database service

**PostgreSQL setup:**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/lablogin"
```

### 3. MySQL (Alternative)
- Best for: Existing MySQL infrastructure
- Setup: Update `DATABASE_URL` and schema
- Pros: Widely supported, familiar
- Cons: Additional configuration needed

## 🔒 Security Configuration

### Production Security Checklist

- [ ] **Change admin secret**: Use strong, unique secret
- [ ] **Enable HTTPS**: SSL certificate for production domain
- [ ] **Configure CORS**: Restrict origins to your domains
- [ ] **Database security**: Use encrypted connections
- [ ] **Rate limiting**: Configure appropriate limits
- [ ] **Environment variables**: Never commit secrets to code
- [ ] **Regular updates**: Keep dependencies updated
- [ ] **Error handling**: Don't expose sensitive information
- [ ] **Monitoring**: Set up logging and alerts
- [ ] **Backups**: Regular database backups

### Security Headers

Add these headers in production:

```javascript
// In your Express app
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

## 📊 Monitoring and Maintenance

### Health Checks

The application includes a health endpoint: `/health`

Monitor these metrics:
- Response time
- Error rates
- Database connection status
- Memory usage
- Disk space (for SQLite)

### Logging

Configure logging in production:

```javascript
// Use structured logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Backup Strategy

**For SQLite:**
```bash
# Daily backup script
cp lab-login-app/server/prisma/production.db backups/production-$(date +%Y%m%d).db
```

**For PostgreSQL:**
```bash
# Daily backup script
pg_dump -h localhost -U username lablogin > backups/lablogin-$(date +%Y%m%d).sql
```

## 🚀 Platform-Specific Deployment Instructions

### Railway Detailed Steps

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and connect:**
   ```bash
   railway login
   railway link
   ```

3. **Set environment variables:**
   ```bash
   railway vars set ADMIN_SECRET=your-secret-here
   railway vars set NODE_ENV=production
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

### Vercel Detailed Steps

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Configure project:**
   ```bash
   vercel
   # Follow prompts to configure
   ```

3. **Set environment variables:**
   ```bash
   vercel env add ADMIN_SECRET
   vercel env add NODE_ENV
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

### Docker Production Setup

1. **Build optimized image:**
   ```bash
   docker build -t lab-login-app:latest .
   ```

2. **Run with environment file:**
   ```bash
   docker run -d \
     --name lab-login \
     -p 4000:4000 \
     --env-file .env.production \
     -v lab-data:/app/server/prisma \
     lab-login-app:latest
   ```

3. **Use Docker Compose for full setup:**
   ```bash
   docker-compose up -d
   ```

## 🔧 Troubleshooting

### Common Deployment Issues

**Build failures:**
- Check Node.js version (requires 18+)
- Verify all dependencies are installed
- Check TypeScript compilation errors

**Database connection issues:**
- Verify DATABASE_URL format
- Check file permissions for SQLite
- Test database connectivity

**Environment variable problems:**
- Ensure all required variables are set
- Check variable names and values
- Verify environment file loading

**Performance issues:**
- Monitor memory usage
- Check database query performance
- Optimize static file serving

### Debug Commands

```bash
# Check application health
curl http://localhost:4000/health

# View application logs
pm2 logs lab-login

# Check database status
cd lab-login-app/server
npx prisma studio

# Test API endpoints
curl -H "x-admin-secret: your-secret" http://localhost:4000/api/members
```

## 📈 Scaling Considerations

### Horizontal Scaling

- **Load balancing**: Use nginx or cloud load balancers
- **Database**: Move to PostgreSQL with connection pooling
- **File storage**: Use cloud storage for QR code images
- **Caching**: Implement Redis for session management

### Performance Optimization

- **Frontend**: Implement code splitting and lazy loading
- **Backend**: Add request caching and response compression
- **Database**: Index frequently queried fields
- **CDN**: Serve static assets from CDN

## 📝 Deployment Checklist

Before going live:

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Admin secret changed from default
- [ ] HTTPS/SSL configured
- [ ] Domain DNS configured
- [ ] Health checks passing
- [ ] Error monitoring set up
- [ ] Backup system implemented
- [ ] Performance tested
- [ ] Security review completed

## 🆘 Support and Resources

- **Application logs**: Check server logs for errors
- **Database**: Use Prisma Studio for database debugging
- **Platform docs**: Refer to specific platform documentation
- **Health endpoint**: Monitor `/health` for application status

---

**Happy Deploying!** 🎉

Choose the deployment option that best fits your needs and follow the platform-specific instructions above. Remember to always test in a staging environment before deploying to production.