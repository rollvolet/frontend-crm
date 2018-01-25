FROM madnificent/ember:2.18.0 as builder

MAINTAINER Erika Pauwels <erika.pauwels@gmail.com>

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN ember build -dev


FROM semtech/ember-proxy-service:1.3.0

RUN mkdir -p /config && \
    echo "auth_basic \"Restricted Content\";" > /config/basic-auth.conf && \
    echo "auth_basic_user_file /etc/nginx/.htpasswd;" >> /config/basic-auth.conf

COPY --from=builder /app/dist /app
