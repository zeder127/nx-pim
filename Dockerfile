FROM node:14-alpine

COPY package*.json /tmp/

RUN cd /tmp && npm install

RUN mkdir -p /pim && cp -a /tmp/node_modules /pim/

WORKDIR /pim

COPY . /pim

EXPOSE 4200 3000

CMD ["npm", "start"]
