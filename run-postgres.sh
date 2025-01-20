#!/bin/bash
docker rm database
docker image rm trans_database
docker build -t trans_database postgres
docker run -d -p 5432:5432 --name database -v "$PWD"/postgres/data:/var/lib/postgresql/data --env-file postgres/.env --network trans_network trans_database