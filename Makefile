all:
	@./run-postgres.sh
	@./run-django.sh
	@./run-nginx.sh

down:
	docker stop server
	docker stop backend
	docker stop database