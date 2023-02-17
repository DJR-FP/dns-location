# Base image
FROM node:16-alpine

# Create app directory
WORKDIR /app

#create conf dir
RUN mkdir -p ./conf

#copy local config file
#COPY config ./config
#COPY dns_names.txt /conf

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
