### STAGE 1: Build ###

FROM node:14 as builder

COPY package*.json /tmp/

RUN cd /tmp && npm install

RUN mkdir -p /pim && cp -a /tmp/node_modules /pim/

WORKDIR /pim

COPY . /pim

EXPOSE 4200 3000

CMD ["npm", "start"]

# RUN npm run build

# ### STAGE 2: Setup ###

# FROM nginx:1.20.0

# COPY --from=builder /pim/dist/apps/pim/ /usr/share/nginx/html

# CMD ["nginx", "-g", "daemon off;"]
