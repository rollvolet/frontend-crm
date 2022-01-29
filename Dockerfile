FROM madnificent/ember:3.28.5 as builder

LABEL maintainer="info@redpencil.io"

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

FROM semtech/static-file-service:0.2.0

COPY nginx/compression.conf /config/compression.conf
COPY nginx/file-upload.conf /config/file-upload.conf
COPY --from=builder /app/dist /data
