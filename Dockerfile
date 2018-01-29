FROM madnificent/ember:2.18.0 as builder

MAINTAINER Erika Pauwels <erika.pauwels@gmail.com>

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN ember build -prod


FROM semtech/ember-proxy-service:1.3.0

COPY --from=builder /app/dist /app
