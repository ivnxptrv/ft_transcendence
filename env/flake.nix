{
  description = "A shell for Darkly project";
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-24.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in {
        devShells.default = pkgs.mkShell {
          packages = [
            (pkgs.python3.withPackages (ps: with ps; [ scrapy ]))
            pkgs.john
          ];
        shellHook = ''
            echo "Nix development environment loaded!"
            echo "----------------------------------"

            # Prompt for Darkly status
            read -p "Is Darkly running? (y/N): " DARKLY_RUNNING
            
            if [[ "$DARKLY_RUNNING" =~ ^[Yy]$ ]]; then
                # Prompt for IP
                read -p "Enter IP address: " HOST 
                export HOST=''${HOST}

                # Prompt for Port
                read -p "Enter Port: " PORT
                export PORT=''${PORT}

                echo "Configured for $HOST:$PORT"
            else
                echo "Darkly not detected. Skipping configuration."
            fi
            echo ""
          '';
        };
      }
    );
}
