.DEFAULT_GOAL := up
MAKEFLAGS += --no-print-directory
SHELL := /bin/bash

all: up

help: ## Display this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

re: ## fully restart all contaienrs
	@docker compose down --volumes && docker compose up -d --remove-orphans --wait

fclean:
	@docker compose down --rmi all --volumes

clean-volumes:
	@docker compose down --volumes

ps:
	@docker compose ps -a

hard-reset-docker:
	@docker compose down
	@docker system prune -a

up: ## Start
	@docker compose build --no-cache
	@docker builder prune -a -f
	@docker compose up -d --wait

down: ## Start
	@docker compose down

.PHONY: help install-nix uninstall-nix develop
