FROM node:23-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
# Install pm2 globally
RUN npm install -g pm2

COPY . .

RUN npm run build

# Use PM2 to run the app
CMD ["pm2-runtime", "dist/main.js"]
