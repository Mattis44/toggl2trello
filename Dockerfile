FROM node:18.12.1-alpine
WORKDIR /app
COPY . .
RUN npm install && cd client && npm install
EXPOSE 3000
EXPOSE 3001
CMD [ "node", "start.js" ]
