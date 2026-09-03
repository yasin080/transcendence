COMPOSE := docker compose

.DEFAULT_GOAL := up
.PHONY: up down build re logs ps prod shell-php shell-front shell-db \
        migrate fresh test clean fclean

# --- Lifecycle --------------------------------------------------------------

## Start the whole stack (the "one command" the subject asks for)
up: .env
	$(COMPOSE) up -d --build
	@echo ""
	@echo "  https://localhost              → app"
	@echo "  https://localhost/api/health   → backend health"
	@echo ""
	@echo "  The browser will warn about the self-signed certificate. Expected."

down:
	$(COMPOSE) down

build: .env
	$(COMPOSE) build

re: down up

## Production mode: nginx serves the static build instead of the Vite dev server
prod: .env
	$(COMPOSE) run --rm frontend npm run build
	NGINX_MODE=prod $(COMPOSE) up -d --build

# --- Inspection -------------------------------------------------------------

logs:
	$(COMPOSE) logs -f --tail=100

ps:
	$(COMPOSE) ps

shell-php:
	$(COMPOSE) exec php sh

shell-front:
	$(COMPOSE) exec frontend sh

shell-db:
	$(COMPOSE) exec mariadb mariadb -u$${DB_USERNAME} -p$${DB_PASSWORD} $${DB_DATABASE}

# --- Laravel ----------------------------------------------------------------

migrate:
	$(COMPOSE) exec php php artisan migrate

## Drop everything and re-run migrations and seeders
fresh:
	$(COMPOSE) exec php php artisan migrate:fresh --seed

test:
	$(COMPOSE) exec php php artisan test

# --- Cleanup ----------------------------------------------------------------

## Remove containers, keep the database
clean:
	$(COMPOSE) down --remove-orphans

## Remove containers, volumes and images — wipes the database and the certs
fclean:
	$(COMPOSE) down -v --remove-orphans --rmi local

# --- Helpers ----------------------------------------------------------------

.env:
	@echo "No .env found — creating one from .env.example."
	@echo "Edit it and set your own passwords before going any further."
	@cp .env.example .env
