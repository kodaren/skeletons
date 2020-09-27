FROM node:12-alpine

WORKDIR /usr/src/app

COPY *.config.js ./
COPY package*.json ./
COPY static ./static
COPY *.json ./

RUN npm install

COPY ./src ./src

RUN npm run build

EXPOSE 3000

ENV HOST=0.0.0.0

CMD [ "node", "__sapper__/build"]
