{
  description = "ft_transcendence Tech Stack";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { 
          inherit system; 
          config.allowUnfree = true; 
        };
        
        # Python environment (Kept local for IDE auto-complete & fast dev server)
        pythonEnv = pkgs.python312.withPackages (ps: with ps; [
          sentence-transformers
          numpy
          fastapi
          uvicorn
          psycopg2
          torch 
          sqlmodel
          pydantic
        ]);
# Installation of Prism Mock Server
prism = pkgs.stdenv.mkDerivation rec {
          pname = "prism-cli";
          version = "5.14.2";

          # We don't need to download a source archive anymore 
          # because makeWrapper will handle the execution logic.
          phases = [ "installPhase" ];

          nativeBuildInputs = [ pkgs.makeWrapper ];

          installPhase = ''
            mkdir -p $out/bin
            # This creates a 'prism' binary in the Nix store
            makeWrapper ${pkgs.nodejs_22}/bin/npx $out/bin/prism \
              --add-flags "-y @stoplight/prism-cli@${version}"
          '';
};
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            prism
            postgresql_16
            # --- Local Runtimes & IDE Tools ---
            pythonEnv
            nodejs_20
            nodePackages.typescript-language-server
            
            # --- Container Orchestration ---
            docker
            direnv
            nix-direnv
          ];

          shellHook = ''
            echo "--- ft_transcendence Dev Shell Loaded ---"
            echo "Python: $(python --version)"
            echo "Node:   $(node --version)"
            echo "Docker: $(docker --version)"

            mkdir -p ./data
          '';
        };
      }
    );
}
