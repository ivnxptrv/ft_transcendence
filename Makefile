.DEFAULT_GOAL := help
MAKEFLAGS += --no-print-directory
# -- Help System --

help: ## Display this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

# -- Installation & Setup --

install-nix: ## Install the Nix package manager (daemon mode)
	@hash -r
	@if command -v nix >/dev/null 2>&1; then \
		true; \
	else \
		echo -n "Are you sure you want to install Nix package manager? (y/n) "; \
		read -r REPLY; \
		if [ "$$REPLY" = "y" ] || [ "$$REPLY" = "Y" ]; then \
			echo "Installing Nix package manager..."; \
			sh <(curl -LfsS https://nixos.org/nix/install) --daemon --yes >/dev/null 2>&1; \
		else \
			echo "Installation aborted."; \
			exit 1; \
		fi \
	fi

uninstall-nix: ## Fully remove Nix and its build users
	@echo -n "Are you sure you want to uninstall Nix? (y/N): "
	@read -r confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		echo "Uninstalling nix package manager..."; \
		sudo systemctl disable --now nix-daemon.socket nix-daemon.service || true; \
		sudo rm -rf /nix /etc/nix /etc/profile.d/nix.sh /etc/*.backup-before-nix ~/.nix-*; \
		for i in $$(seq 1 32); do sudo userdel nixbld$$i 2>/dev/null || true; done; \
		sudo groupdel nixbld 2>/dev/null || true; \
		hash -r; \
	else \
		echo "Aborted."; \
	fi

# -- Development --

develop: install-nix ## Enter the Nix development shell defined in ./env/
	@echo "Entering development environment..."
	@nix develop ./env/ || true

start: develop ## Just get started


.PHONY: help install-nix uninstall-nix develop

# Remark
# ln -sv "env/conf.conf" "conf.conf";
