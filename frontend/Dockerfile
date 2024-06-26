# Base image
FROM nginx:alpine

# Copy the build files
COPY /public /usr/share/nginx/html

# Expose the port the app runs on
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
