FROM node:12.22.1-alpine3.10

WORKDIR /app

COPY ./package.json  ./yarn.lock ./
RUN yarn install

ARG graphql_url
COPY ./ ./
RUN yarn run build:production

FROM nginx:mainline-alpine

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=0 /app/public /public
