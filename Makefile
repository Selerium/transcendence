# creates the app as well any required extra folders
start:
	mkdir -p ${PWD}/postgres/data/
	docker compose -f ./docker-compose.yml up -d

# stop the app
stop:
	docker compose -f ./docker-compose.yml down

all: $(start)

# stops app and also removes volumes
clean:
	docker compose -f ./docker-compose.yml down -v

# stops app and also removes volumes and db data folder
fclean:
	docker compose -f ./docker-compose.yml down -v
	sudo rm -rf postgres/data