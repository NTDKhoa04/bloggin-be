FROM node:23-alpine
WORKDIR /bloggin-be
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "start:dev"]