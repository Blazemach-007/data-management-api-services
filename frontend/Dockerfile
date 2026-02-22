# Use Node.js 20 (Slim version) as required by Next.js
FROM node:20-slim

# Set working directory inside the container
WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install all dependencies (development dependencies are needed to build)
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application for production
RUN npm run build

# Expose the Next.js port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]