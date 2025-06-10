FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    git \
    bash \
    curl \
    && npm install -g @expo/cli

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S expo -u 1001
RUN chown -R expo:nodejs /app
USER expo

# Expose Expo ports
EXPOSE 19000 19001 19002 19006

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:19000 || exit 1

# Default command
CMD ["yarn", "start", "--non-interactive"] 