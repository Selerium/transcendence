
# NAME = transcendence

DOCKER_COMPOSE = docker-compose 


all: $(NAME)

# build: 
# 	$(DOCKER_COMPOSE) build

$(NAME): 
	$(DOCKER_COMPOSE) up -d --build

down:
	$(DOCKER_COMPOSE) down
stop:
	$(DOCKER_COMPOSE) stop

post_exec:
	docker exec -it postgres sh
djang_exec:
	docker exec -it django sh

clean:
	$(DOCKER_COMPOSE) down --rmi all

	
fclean: clean 
		docker system prune -af

re: fclean all

.PHONY: all clean fclean re