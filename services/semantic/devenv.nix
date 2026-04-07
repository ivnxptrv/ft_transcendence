{ pkgs, config, lib, ... }: {

  cachix.enable = false;

  # loads .env
  dotenv.enable = true;
  
  packages = [
    pkgs.stdenv.cc.cc.lib            # Required for many Python binary extensions
    pkgs.zlib
    pkgs.nodejs                      # Added this since you use npx in your processes
  ];
  
  languages.python = {
    enable = true;
    lsp.enable = true;
    package = pkgs.python311;

    venv.enable = true;
    venv.requirements = ''
      --extra-index-url https://download.pytorch.org/whl/cpu
      torch
      fastapi
      uvicorn[standard]
      sentence-transformers
      psycopg2-binary
    '';
  };

  # Fix dynamic linking for ML libraries (PyTorch)
  # When pip installs PyTorch, it expects standard Linux libraries to be in specific places.
  # This tells Nix where to find them.
  env.LD_LIBRARY_PATH = lib.makeLibraryPath [
    pkgs.stdenv.cc.cc.lib
    pkgs.zlib
  ];

  services.postgres = {
    enable = true;
    package = pkgs.postgresql_16; 
    initialDatabases = [
      {
        name = "${config.env.DB_NAME}";
        schema = ./schema.sql;
      }
    ];
  };

  # psql $DATABASE_URL
  # \l -- list all db
  env.DATABASE_URL = "postgres:///${config.env.DB_NAME}?host=${config.env.DEVENV_RUNTIME}/postgres";

  # processes
  processes = {
    # identity.exec = "npx @stoplight/prism-cli mock ../identity/contract.yaml -p ${config.env.IDENTITY_PORT}";
    # ledger.exec = "npx @stoplight/prism-cli mock ../ledger/contract.yaml -p ${config.env.LEDGER_PORT}";
    semantic.exec = "uvicorn main:app --reload --port ${config.env.SEMANTIC_PORT}";
    # interaction.exec = "npx @stoplight/prism-cli mock ../interaction/contract.yaml -p ${config.env.INTERACTION_PORT}";
  };

enterShell = ''
    export VIRTUAL_ENV=$DEVENV_STATE/venv
    export PATH=$VIRTUAL_ENV/bin:$PATH
  '';
  
  tasks."db:setup" = {
    exec = ''
      echo "Wiping database state for a fresh start..."
      rm -rf .devenv/state/postgres
      rm -rf ${config.env.DEVENV_RUNTIME}/postgres
      sleep 5
    '';
    before = [ "devenv:processes:postgres" ];
  };


}
