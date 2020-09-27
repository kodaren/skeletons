FROM node:12-alpine

WORKDIR /usr/src/app

COPY *.config.js ./
COPY package*.json ./
COPY static ./static
COPY *.json ./

RUN npm install

COPY ./src ./src

RUN npm run export

EXPOSE 5000

ENV HOST=0.0.0.0

CMD ["npx", "serve", "__sapper__/export"]
#CMD ["npx", "serve", "__sapper__/export"]
#CMD [ "node", "__sapper__/build"]
