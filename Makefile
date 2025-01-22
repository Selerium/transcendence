start:
	mkdir -p ${PWD}/postgres/data/
	docker compose -f ./docker-compose.yml up -d

stop:
	docker compose -f ./docker-compose.yml down

all: $(start)

# clean:
# 	docker compose -f ./docker-compose.yml down -v