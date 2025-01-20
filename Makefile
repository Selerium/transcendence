all:
	@./run-postgres.sh
	@./run-django.sh
	@./run-nginx.sh