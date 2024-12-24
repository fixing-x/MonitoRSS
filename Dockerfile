# Use a base image
FROM node:18-slim

# Set environment variables
ENV NODE_ENV=production \
    BACKEND_API_NODE_ENV=local \
    BACKEND_API_PORT=8000 \
    BACKEND_API_DEFAULT_MAX_FEEDS=999999 \
    BACKEND_API_USER_FEEDS_API_HOST=http://localhost:5000/ \
    BACKEND_API_FEED_REQUESTS_API_HOST=http://localhost:5000/ \
    BACKEND_API_FEED_USER_AGENT=MonitoRSS \
    BACKEND_API_RABBITMQ_BROKER_URL=amqp://guest:guest@localhost:5672/ \
    BACKEND_API_USER_FEEDS_API_KEY=user-feeds-api-key \
    BACKEND_API_FEED_REQUESTS_API_KEY=feed-requests-api-key \
    LOG_LEVEL=info

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy all services into the container
COPY . ./

# Install app dependencies
RUN npm install --production && npm cache clean --force

# Expose ports for services
EXPOSE 8000

# Command to run all services
CMD ["node", "dist/main.js"]