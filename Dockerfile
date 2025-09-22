# Multi-stage Docker build for Lab Login System
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files for both server and client
COPY lab-login-app/server/package*.json ./server/
COPY lab-login-app/client/package*.json ./client/

# Install dependencies
RUN cd server && npm ci --only=production
RUN cd client && npm ci --only=production

# Build the application
FROM base AS builder
WORKDIR /app

# Copy source code
COPY lab-login-app/ ./lab-login-app/

# Copy dependencies
COPY --from=deps /app/server/node_modules ./lab-login-app/server/node_modules
COPY --from=deps /app/client/node_modules ./lab-login-app/client/node_modules

# Generate Prisma client
WORKDIR /app/lab-login-app/server
RUN npx prisma generate

# Build backend
RUN npm run build

# Build frontend
WORKDIR /app/lab-login-app/client
RUN npm run build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 lablogin

# Copy built application
COPY --from=builder --chown=lablogin:nodejs /app/lab-login-app/server/dist ./server/dist
COPY --from=builder --chown=lablogin:nodejs /app/lab-login-app/server/package*.json ./server/
COPY --from=builder --chown=lablogin:nodejs /app/lab-login-app/server/prisma ./server/prisma
COPY --from=builder --chown=lablogin:nodejs /app/lab-login-app/client/dist ./client/dist

# Install production dependencies
WORKDIR /app/server
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Create database directory with proper permissions
RUN mkdir -p /app/server/prisma && chown -R lablogin:nodejs /app/server/prisma

USER lablogin

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
CMD ["npm", "start"]