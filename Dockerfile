# Simple single-stage Docker build for Lab Login System
FROM node:18-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 lablogin

# Copy source code
COPY lab-login-app/ ./lab-login-app/

# Install server dependencies and build
WORKDIR /app/lab-login-app/server
RUN npm ci && \
    npx prisma generate && \
    npm run build && \
    npm ci --only=production

# Install client dependencies and build
WORKDIR /app/lab-login-app/client
RUN npm ci && \
    npm run build

# Change ownership
WORKDIR /app
RUN chown -R lablogin:nodejs /app

# Create database directory with proper permissions
RUN mkdir -p /app/lab-login-app/server/prisma && \
    chown -R lablogin:nodejs /app/lab-login-app/server/prisma

USER lablogin

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
WORKDIR /app/lab-login-app/server
CMD ["npm", "start"]