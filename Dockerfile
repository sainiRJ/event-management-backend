# Use Node.js official image as the base
FROM node:18

# Set the working directory
 WORKDIR /src

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy the application code
COPY . .

# Install dependencies
RUN npm install

# Expose the application port
EXPOSE 3080


# Start the application
CMD ["npm", "run", "dev"]
