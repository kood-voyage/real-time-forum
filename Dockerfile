FROM golang:1.21-alpine3.19

WORKDIR /real-time/forum

COPY go.mod go.sum Makefile package*.json ./

RUN go mod download