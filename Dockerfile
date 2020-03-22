FROM madnificent/ember:3.15.2 as builder

LABEL maintainer="Erika Pauwels <erika.pauwels@gmail.com>"

WORKDIR /app
COPY package.json .
RUN yarn install
COPY . .
RUN ember build -prod


FROM semtech/ember-proxy-service:1.4.0

COPY --from=builder /app/dist /app
