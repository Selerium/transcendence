# T R A N S C E N D E N C E

Transcendence is the final project in the 42 Common Core program. The project is a dynamic single-page-application (SPA) that is built without the help of modern frontend frameworks. The website runs a platform for users to be able to join a game of PONG against other registered users, participate in tournaments, add friends and message them.

## How to Run

You can run the project using `make` in the root directory of the project (Docker Engine must be running).
Running `make down` will stop the containers.

## Architecture

The project consists of three Docker containers:
- **server**: runs *nginx* in a container to serve frontend as well proxy API routes to backend
- **backend**: runs *django* to handle all API calls with database connectivity
- **database**: runs *postgres* to be used by django for handling all site-related data and information

Volumes are also used for the project (`/postgres/data/` holds all database info, `/django/app/` holds all backend info, `/nginx/src/` holds all frontend info).

All three containers are connected on a Docker Network (`trans_network`) that allows for interconnectivity between the different parts of the project.

## APIs

- **GET** `../api/users/`: *gets all users*
- **POST** `../api/users/`: *creates a new user*
- **GET** `../api/users/{id}`: *returns data of specific user*
- **PUT** `../api/users/{id}`: *update data of specific user*
