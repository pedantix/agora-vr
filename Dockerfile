FROM node:18-alpine
#ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "webpack.config.js", "webpack.prod.config.js", "easyrtc-server.js", "./"]

COPY src ./src
COPY server ./server
COPY dist ./dist
COPY examples ./examples

RUN npm install
RUN npm run build

EXPOSE 7373

CMD ["npm", "run", "start"]