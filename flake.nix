{
  description = "Modular Monorepo Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    devenv.url = "github:cachix/devenv";
  };

  outputs = { self, nixpkgs, devenv, ... } @ inputs:
    let
      supportedSystems = [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" "x86_64-darwin" ];
      forEachSystem = nixpkgs.lib.genAttrs supportedSystems;

      registry = {
        identity = { port = 3000; };
        billing  = { port = 3001; };
        mailer   = { port = 3002; };
      };

      # Function to create a wrapped Prism binary per system
      mkPrism = pkgs: pkgs.stdenv.mkDerivation rec {
        pname = "prism-cli";
        version = "5.14.2";
        phases = [ "installPhase" ];
        nativeBuildInputs = [ pkgs.makeWrapper ];
        installPhase = ''
          mkdir -p $out/bin
          makeWrapper ${pkgs.nodejs_22}/bin/npx $out/bin/prism \
            --add-flags "-y @stoplight/prism-cli@${version}" \
            --set HOME $TMPDIR
        '';
      };

      # The Generator now takes the system-specific pkgs directly
      mkDevEnv = targetService: pkgs: devenv.lib.mkShell {
        inherit inputs pkgs;
        modules = [
          (./services/${targetService}/env.nix)
          ({ pkgs, ... }: {
            # Use the prism built for this specific system
            packages = [ (mkPrism pkgs) ];
            
            processes = builtins.listToAttrs (
              builtins.map (mockName: {
                name = "mock-${mockName}";
                value = {
                  exec = "prism mock services/${mockName}/openapi.yaml -p ${toString registry.${mockName}.port}";
                };
              }) (builtins.filter (n: n != targetService) (builtins.attrNames registry))
            );
            
            enterShell = ''
              echo "🚀 Environment loaded for: ${targetService}"
              # We stay at root but provide a shortcut to the service dir
              echo "Target service directory: ./services/${targetService}"
            '';
          })
        ];
      };

    in {
      devShells = forEachSystem (system:
        let 
          # Correct way to import pkgs with unfree allowed per system
          pkgs = import nixpkgs { 
            inherit system; 
            config.allowUnfree = true; 
          };
        in {
          identity = mkDevEnv "identity" pkgs;
          billing  = mkDevEnv "billing" pkgs;
          # Added a default shell for general root tasks
          default = pkgs.mkShell {
            packages = [ pkgs.nil pkgs.nixpkgs-fmt ]; # Nix LSP and Formatter
          };
        }
      );
    };
}
