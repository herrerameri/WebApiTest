FROM node:latest
MAINTAINER Nicolas Hechim

ENV NODE_ENV=production 
ENV PORT=3000
ENV MONGO_URL=192.168.99.100

COPY      . /var/www
WORKDIR   /var/www

RUN       npm install
#VOLUME ["/var/www"]

EXPOSE $PORT
ENTRYPOINT ["npm", "start"] 

