{ pkgs, config, lib, ... }: {
  cachix.enable = false;
  # loads .env
  dotenv.enable = true;
  dotenv.filename = [
      ".env-root" # Dir above
      ".env"      # Current dir
    ];
  
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
      fastapi
      uvicorn[standard]
      psycopg2-binary
      sqlalchemy>=2.0.0
      alembic
      asyncpg
      pydantic[all]
      email-validator
      pyjwt[crypto]
      bcrypt
      pyyaml
      pytest
      pytest-asyncio
      httpx
      aiosqlite
      cryptography
    '';
  };

  services.postgres = {
    enable = true;
    port = 5433;
    package = pkgs.postgresql_16; 
    initialDatabases = [
      { name = "${config.env.DB_NAME}"; }
    ];
  };

  # psql $DATABASE_URL
  # \l -- list all db
  env.DATABASE_URL = "postgres:///${config.env.DB_NAME}?host=${config.env.DEVENV_RUNTIME}/postgres";

  # processes
  processes = {
    identity = {
      exec = ''
      while ! pg_isready -d ${config.env.DB_NAME} -p 5433 > /dev/null 2>&1; do
        echo "Waiting for Postgres at localhost:5433..."
        sleep 1
      done
      sleep 3
      alembic upgrade head && uvicorn app.main:app --reload --port ${config.env.IDENTITY_PORT}
    '';
    };
    # ledger.exec = "npx @stoplight/prism-cli mock ../ledger/contract.yaml -p ${config.env.LEDGER_PORT}";
    # semantic.exec = "uvicorn main:app --reload --port ${config.env.SEMANTIC_PORT}";
    # interaction.exec = "npx @stoplight/prism-cli mock ../interaction/contract.yaml -p ${config.env.INTERACTION_PORT}";
  };

  enterShell = ''
      export VIRTUAL_ENV=$DEVENV_STATE/venv
      export PATH=$VIRTUAL_ENV/bin:$PATH
    '';

  tasks."db:setup" = {
      exec = ''
        rm -rf .devenv/state/postgres
      '';
      before = [ "devenv:processes:postgres" ];
    };

  scripts.migrate.exec = ''
      if [ -z "$1" ]; then
        echo "Usage: migrate 'message'"
      else
        alembic revision --autogenerate -m "$1"
      fi
    '';

}
# alembic init migrations
