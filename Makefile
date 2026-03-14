.DEFAULT_GOAL := help
MAKEFLAGS += --no-print-directory
SHELL := /bin/bash
# -- Help System --

help: ## Display this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

# -- Installation & Setup --

install-nix:  ## Install Nix and enable experimental features
	@hash -r
	@if command -v nix >/dev/null 2>&1; then \
		echo "Nix is already installed."; \
	else \
		echo -n "Are you sure you want to install Nix package manager? (y/n) "; \
		read -r REPLY; \
		if [ "$$REPLY" = "y" ] || [ "$$REPLY" = "Y" ]; then \
			echo "Installing Nix package manager..."; \
			curl -LfsS https://nixos.org/nix/install | bash -s -- --daemon --yes >/dev/null 2>&1; \
			echo "Enabling experimental features (nix-command flakes)..."; \
			sudo mkdir -p /etc/nix; \
			echo "experimental-features = nix-command flakes" | sudo tee -a /etc/nix/nix.conf >/dev/null; \
			echo "Nix package manager installed and configured!"; \
			echo "================================================================="; \
			echo "IMPORTANT: Restart your terminal or run: source /etc/profile.d/nix.sh"; \
			echo "================================================================="; \
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

develop:  ## Enter the Nix development shell defined in ./env/
	@echo "Entering development environment..."
	@nix develop || true

start: develop ## Just get started

.PHONY: help install-nix uninstall-nix develop
