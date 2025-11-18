FROM node:24-alpine

# Create app directory
WORKDIR /app

# Copy package manifests first and install dependencies
COPY package*.json ./

# Install only production dependencies for smaller image
RUN npm install --production

# Copy application source
COPY . .

# Set environment and port
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Run the app
CMD ["node", "src/index.js"]
