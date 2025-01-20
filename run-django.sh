#!/bin/bash
docker rm backend
docker image rm trans_backend
docker build -t trans_backend django
docker run -d -p 8000:8000 -v $PWD/django/app:/usr/src/app --name backend --network trans_network trans_backend 