FROM node:13.0.1

WORKDIR /var/app

COPY package.json package-lock.json /var/app/

RUN npm install

ENV NODE_PATH=/var/app
ENV NODE_ENV=production

COPY . .

CMD npm start
