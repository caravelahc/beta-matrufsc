FROM alpine:latest

ENV DEBIAN_FRONTEND=noninteractive
RUN apk add \
    bash \
    git \
    make \
    python3
