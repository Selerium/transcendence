#!/bin/bash
docker rm server
docker image rm trans_server
docker build -t trans_server nginx
docker run -d -p 8080:80 --name server -v "$PWD"/nginx/src:/usr/share/nginx/html --env-file nginx/.env --network trans_network trans_server