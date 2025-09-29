# Use Node 24-slim
FROM node:24-slim

WORKDIR /app

# RUN apt-get update && apt-get upgrade -y && apt-get clean

COPY package*.json ./
RUN npm install

COPY . .

# Create folders inside container (optional, volume will override)
RUN mkdir -p /app/images /app/logs

EXPOSE 5000

CMD ["npm", "start"]
