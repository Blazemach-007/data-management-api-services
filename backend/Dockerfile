# Use Node.js 20 (Slim version) for consistency
FROM node:20-slim

# Set working directory inside the container
WORKDIR /app

# Copy dependency files first (for better caching)
COPY package*.json ./

# Install dependencies (only production)
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Expose the API port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]