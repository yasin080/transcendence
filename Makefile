COMPOSE := docker compose

# php-fpm runs as the host user so it can write to the bind-mounted backend
# (logs). Taken from the shell, never typed into .env: a wrong value there only
# shows up on Linux, as "Permission denied" on the first error to be logged.
ifneq ($(shell docker info --format '{{.SecurityOptions}}' 2>/dev/null | grep -o rootless),)
export UID := 0
export GID := 0
else
export UID := $(shell id -u)
export GID := $(shell id -g)
endif

# Port HTTPS published (from .env; 1443 if not set)
HTTPS_PORT := $(or $(shell grep -E '^HTTPS_PORT=' .env 2>/dev/null | cut -d= -f2),1443)

.DEFAULT_GOAL := all
.PHONY: all up dev urls down build rebuild re logs ps shell-php shell-front shell-db \
        migrate fresh test backup restore clean fclean

# --- Lifecycle --------------------------------------------------------------

all: up

## Start the whole stack in production mode (the "one command" the subject asks for):
## nginx serves the static build of the frontend
up: .env
	$(COMPOSE) run --rm frontend npm run build
	NGINX_MODE=prod $(COMPOSE) up -d --build
	@$(MAKE) --no-print-directory urls

## Development mode: nginx proxies to the Vite dev server (hot reload)
dev: .env
	NGINX_MODE=dev $(COMPOSE) up -d --build
	@$(MAKE) --no-print-directory urls

urls:
	@echo ""
	@echo "  https://localhost:$(HTTPS_PORT)              → app"
	@echo "  https://localhost:$(HTTPS_PORT)/api/health   → backend health"
	@echo ""
	@echo "  The browser will warn about the self-signed certificate. Expected."

down:
	$(COMPOSE) down --remove-orphans

re: down
	@$(MAKE) up

# --- Images -------------------------------------------------------------

rebuild: .env
	$(COMPOSE) up -d --build

build: .env
	$(COMPOSE) build

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
	$(COMPOSE) exec mariadb sh -c 'mariadb -u"$$MARIADB_USER" -p"$$MARIADB_PASSWORD" "$$MARIADB_DATABASE"'

# --- Laravel ----------------------------------------------------------------

migrate:
	$(COMPOSE) exec php php artisan migrate

## Drop everything and re-run migrations and seeders
fresh:
	$(COMPOSE) exec php php artisan migrate:fresh --seed --force

test:
	$(COMPOSE) exec php php artisan test

# --- Backups --------------------------------------------------------------

## Dump the database now, on top of the automatic dump every 6 hours
backup:
	$(COMPOSE) exec backup /scripts/backup.sh

## Load a dump into the database: make restore FILE=backups/<date>.sql.gz
restore:
	@test -f "$(FILE)" || { echo "Usage: make restore FILE=backups/<date>.sql.gz"; exit 1; }
	gunzip -c "$(FILE)" | $(COMPOSE) exec -T mariadb sh -c 'mariadb -u"$$MARIADB_USER" -p"$$MARIADB_PASSWORD" "$$MARIADB_DATABASE"'
	@echo "Restored $(FILE)"

# --- Cleanup ----------------------------------------------------------------

## Remove containers, keep the database
clean: down

## Remove containers, volumes and images — wipes the database and the certs
## (the dumps in ./backups survive)
fclean:
	$(COMPOSE) down -v --remove-orphans --rmi local

# --- Helpers ----------------------------------------------------------------

.env:
	@echo "No .env found — creating one from .env.example."
	@echo "Edit it and set your own passwords before going any further."
	@cp .env.example .env
