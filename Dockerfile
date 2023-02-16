# Base image
FROM node:16-alpine

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app files
COPY . .

# Expose port 3000
EXPOSE 3000

# Start app
CMD [ "npm", "start" ]
