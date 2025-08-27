FROM node:lts AS builder

WORKDIR /app

# Copy package files to install dependencies
COPY package.json ./

# Install dependencies
RUN npm install --production

# Install wrangler globally
RUN npm install -g wrangler

# Copy the rest of the application files
COPY . .

# Expose the port that wrangler will use
EXPOSE 8787

# Command to start the application
CMD ["wrangler", "dev", "--ip=0.0.0.0", "--port=8787"]