FROM node:13.0.1

# Security update the base Ubuntu OS
# RUN apt-get update && apt-get -y upgrade

# Set the timezone
ENV TZ=UTC

# explicitly install latest npm version
RUN npm install -g npm@^6.9.0

# Remove npm cache
RUN rm -rf /root/.npm

WORKDIR /usr/local/etc

# Install the app dependencies
RUN npm config set engine-strict true
# RUN npm i
RUN rm ~/.npmrc

RUN mkdir /var/app

# Install NPM Packages via NPM
COPY app/package.json app/package-lock.json /var/app/

RUN npm install

ENV NODE_PATH=/var/app

ENV NODE_ENV=production

WORKDIR /var/app

# Copy all source files to the image
COPY app /var/app

CMD npm start
