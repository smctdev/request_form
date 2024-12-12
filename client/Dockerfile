# Use an official Node runtime as a parent image
FROM node:16-alpine AS build

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json to the working directory
COPY ./package*.json ./

# Install the dependencies
RUN npm install

# Copy the remaining application files to the working directory
COPY . .

# Build the application
RUN npm run build

# Use a lightweight server to serve the static files
FROM nginx:alpine

# Copy the build files to the NGINX server
COPY --from=build /app/build /usr/share/nginx/html

# Copy the NGINX configuration file
COPY default.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 8001

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
