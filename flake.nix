{
  description = "Monorepo Microservice Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    # Bring in the devenv framework for native process and DB management
    devenv.url = "github:cachix/devenv";
  };

  outputs = { self, nixpkgs, devenv, ... } @ inputs:
  let
    # 1. SUPPORTED ARCHITECTURES
    # This ensures your flake works on Linux, Intel Macs, and Apple Silicon (M1/M2/M3)
    supportedSystems = [
      "x86_64-linux"
      "aarch64-linux"
      "x86_64-darwin"
      "aarch64-darwin"
    ];

    # Helper function to generate attributes for all supported systems
    forEachSystem = nixpkgs.lib.genAttrs supportedSystems;

    # 2. THE SERVICE REGISTRY
    # Define every service in your monorepo here. Add new ones as your app grows.
    registry = {
      identity = { port = 3000; db = "identity_db"; };
      billing  = { port = 3001; db = "billing_db"; };
      mailer   = { port = 3002; db = "mailer_db"; };
    };

    # 3. THE ENVIRONMENT GENERATOR FUNCTION
    # Dynamically builds the devenv configuration based on the target service
    mkDevEnv = targetService: system: pkgs: devenv.lib.mkShell {
      inherit inputs pkgs;
      modules = [
        ({ pkgs, lib, ... }: {
          
          # A. Base Packages
          packages = [ 
            pkgs.nodejs_20 
            pkgs.postgresql 
          ];
          
          # B. Environment Variables (.env auto-loading)
          dotenv.enable = true;

          # C. Real Database Provisioning (Only for the target service)
          services.postgres = {
            enable = true;
            initialDatabases = [{ name = registry.${targetService}.db; }];
            listen_addresses = "127.0.0.1";
            port = 5432;
          };

          # D. Process Management (Real App + Dynamic Mocks)
          processes = {
            # Start the REAL NestJS app for the target service
            "real-${targetService}".exec = "ls";
          } 
          // 
          # Merge in dynamically generated Prism mocks for everything EXCEPT the target service
          builtins.listToAttrs (
            builtins.map (mockName: {
              name = "mock-${mockName}";
              value = {
                exec = "ls";
              };
            }) (builtins.filter (n: n != targetService) (builtins.attrNames registry))
          );

          # E. Helpful Greeting
          enterShell = ''
            echo "====================================================="
            echo "🚀 Environment loaded for: ${targetService}"
            echo "Type 'devenv up' to start the database, app, and mocks!"
            echo "====================================================="
          '';
        })
      ];
    };

  in {
    # 4. EXPOSE THE DEV SHELLS
    # This maps the generator function to the actual `nix develop` commands for every OS
    devShells = forEachSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        # The commands your team will actually run
        identity = mkDevEnv "identity" system pkgs;
        billing  = mkDevEnv "billing" system pkgs;
        mailer   = mkDevEnv "mailer" system pkgs;
        
        # Optional: A default fallback if someone just types `nix develop`
        default = pkgs.mkShell {
          packages = [ pkgs.figlet ];
          shellHook = ''
            figlet "Monorepo"
            echo "Please specify a service to develop:"
            echo "→ nix develop .#identity"
            echo "→ nix develop .#billing"
            echo "→ nix develop .#mailer"
          '';
        };
      }
    );
  };
}
