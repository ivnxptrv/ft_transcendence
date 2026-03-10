.DEFAULT_GOAL := help
MAKEFLAGS += --no-print-directory
COMPOSE-FILE := ./env/docker-compose-dev.yml
SHELL := /bin/bash
# -- Help System --

help: ## Display this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

# -- Installation & Setup --

install-nix: uninstall-nix ## Install the Nix package manager (daemon mode)
	@hash -r
	@if command -v nix >/dev/null 2>&1; then \
		true; \
	else \
		echo -n "Are you sure you want to install Nix package manager? (y/n) "; \
		read -r REPLY; \
		if [ "$$REPLY" = "y" ] || [ "$$REPLY" = "Y" ]; then \
			echo "Installing Nix package manager..."; \
			curl -LfsS https://nixos.org/nix/install | sh -s -- --daemon --yes >/dev/null 2>&1; \
			echo "Nix package manager installed!"; \
			echo "Nix won't work in active shell sessions until you restart them."; \
		else \
			echo "Installation aborted."; \
			exit 1; \
		fi \
	fi

uninstall-nix: ## Fully remove Nix and its build users
	@echo -n "Are you sure you want to uninstall any signs of Nix on a system first? (y/N): "
	@read -r confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
			echo "Stopping Nix daemon..."; \
			sudo systemctl disable --now nix-daemon.socket nix-daemon.service 2>/dev/null || true; \
			echo "Restoring shell configuration backups..."; \
			for backup in /etc/*.backup-before-nix; do \
					if [ -f "$$backup" ]; then \
							sudo mv "$$backup" "$${backup%.backup-before-nix}"; \
					fi; \
			done; \
			echo "Removing Nix directories and users..."; \
			sudo rm -rf /nix /etc/nix /etc/profile.d/nix.sh ~/.nix-*; \
			for i in $$(seq 1 32); do sudo userdel nixbld$$i 2>/dev/null || true; done; \
			sudo groupdel nixbld 2>/dev/null || true; \
			hash -r; \
			echo "Nix uninstalled and backups restored."; \
	else \
			echo "Aborted."; \
	fi
# -- Development --

develop: install-nix ## Enter the Nix development shell defined in ./env/
	@echo "Entering development environment..."
	@nix develop ./env/ || true

start: develop ## Just get started

up:
	@docker compose -f $(COMPOSE-FILE) up -d --wait

down: 
	@docker compose -f $(COMPOSE-FILE) down

ps:
	@docker compose -f $(COMPOSE-FILE) ps -a

.PHONY: help install-nix uninstall-nix develop

# Remark
# ln -sv "env/conf.conf" "conf.conf";
