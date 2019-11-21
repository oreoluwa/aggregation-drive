# FROM node:13.0.1
FROM node:10.17.0

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update -q && apt-get install -y fuse libfuse-dev \
	&& apt-get clean -y && rm -rf /var/lib/apt/lists/*

RUN sed -i'' 's/^# *user_allow_other/user_allow_other/' /etc/fuse.conf # uncomment user_allow_other
RUN chmod a+r /etc/fuse.conf # make it readable by anybody, it is not the default on Ubuntu

WORKDIR /var/app

COPY package.json package-lock.json /var/app/

RUN npm install

ENV NODE_PATH=/var/app
ENV NODE_ENV=production

COPY . .

COPY entrypoint /entrypoint

VOLUME /mnt

CMD ["/entrypoint"]
# CMD npm start
