FROM node:20-alpine

RUN apk --no-cache add postgresql-client
RUN apk add --no-cache --virtual .gyp python3 make g++ git
RUN npm install -g @nestjs/cli

WORKDIR /home/node
RUN mkdir -p node_modules

COPY . .
