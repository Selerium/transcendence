
# NAME = transcendence

DOCKER_COMPOSE = docker-compose -f docker-compose.yml 


$(NAME) : build up

all: 
	$(NAME)

build: 
	$(DOCKER_COMPOSE) build

up: 
	$(DOCKER_COMPOSE) up -d --build

down:
	$(DOCKER_COMPOSE) down
stop:
	$(DOCKER_COMPOSE) stop

clean:
	$(DOCKER_COMPOSE) down --rmi all
	
fclean: clean 
		docker system prune -af

re: fclean all

.PHONY: all clean fclean re