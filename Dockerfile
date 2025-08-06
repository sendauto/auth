# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Build the application
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 auth247

# Copy the built application
COPY --from=builder --chown=auth247:nodejs /app/dist ./dist
COPY --from=builder --chown=auth247:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=auth247:nodejs /app/package.json ./package.json
COPY --from=builder --chown=auth247:nodejs /app/shared ./shared

USER auth247

EXPOSE 5000

ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
