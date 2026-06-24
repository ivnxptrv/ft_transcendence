# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy configuration files
# COPY package*.json ./
COPY . .

# Install dependencies
RUN npm ci

# Then copy only your source code and config files
# COPY src/ ./src
# COPY public/ ./public
# COPY next.config.ts ./
# COPY tsconfig.json ./

# Build the application
# generate the .next/standalone folder
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Don't run production code as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone server and static assets from the builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
