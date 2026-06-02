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
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            devenv
          ];

          shellHook = ''
            echo "--- ft_transcendence Dev Shell Loaded ---"
            echo "Docker: $(docker --version)"
            echo "To develop any service, navigate to the directory and run devenv up"
            echo "Example:"
            echo -e "\tNavigate: cd ./web"
            echo -e "\tStart environment: devenv up"
            echo -e "\tEnter shell in a new terminal: devenv shell"
          '';
        };
      }
    );
}
