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

      in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # --- Local Runtimes & IDE Tools ---
            pythonEnv
            nodejs_20
            nodePackages.typescript-language-server
            
            # --- Container Orchestration ---
            docker
          ];

          shellHook = ''
            echo "--- ft_transcendence Dev Shell Loaded ---"
            echo "Python: $(python --version)"
            echo "Node:   $(node --version)"
            echo "Docker: $(docker --version)"
          '';
        };
      }
    );
}
