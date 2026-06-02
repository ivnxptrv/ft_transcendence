{ pkgs, config, lib, ... }: {
  cachix.enable = false;
  
  # loads .env
  dotenv.enable = true;
  dotenv.filename = [
    ".env-root" # Dir above
    ".env"      # Current dir
  ];

  env = {
    WEB_URL = "http://${config.env.WEB_HOST}:${config.env.WEB_PORT}";
    IDENTITY_URL = "http://${config.env.IDENTITY_HOST}:${config.env.IDENTITY_PORT}";
    LEDGER_URL = "http://${config.env.LEDGER_HOST}:${config.env.LEDGER_PORT}";
    SEMANTIC_URL = "http://${config.env.SEMANTIC_HOST}:${config.env.SEMANTIC_PORT}";
    INTERACTION_URL = "http://${config.env.INTERACTION_HOST}:${config.env.INTERACTION_PORT}";
  };
  
  packages = [
    pkgs.stdenv.cc.cc.lib
    pkgs.zlib
    pkgs.nodejs
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
      httpx
    '';
  };

  services.postgres = {
    enable = true;
    port = 5432; 
    package = pkgs.postgresql_16; 
    initialDatabases = [
      { name = "ledger_db"; }
    ];
    # Forces Postgres to listen on TCP/IP so DBeaver can connect over localhost:5432
    settings.listen_addresses = pkgs.lib.mkForce "127.0.0.1";
  };

  # Safe static env fallback 
  env.DATABASE_URL = "postgresql+asyncpg://user@127.0.0.1:5432/ledger_db";

  # processes
  processes = {
    ledger = {
      exec = ''
        # 1. Wait for the Postgres engine to start over TCP loopback
        while ! pg_isready -h 127.0.0.1 -p 5432 > /dev/null 2>&1; do
          echo "Waiting for Postgres engine at 127.0.0.1:5432..."
          sleep 1
        done

        # 2. Point to the TCP loopback network interface to fix the FileNotFoundError
        export DATABASE_URL="postgresql+asyncpg://user@127.0.0.1:5432/ledger_db"

        # 3. Set Python path explicitly to the current folder
        export PYTHONPATH=$PYTHONPATH:$(pwd)

        # 4. Bulletproof Port Resolution
        FINAL_PORT="$LEDGER_PORT"
        if [ -z "$FINAL_PORT" ] && [ -f .env ]; then
          FINAL_PORT=$(grep LEDGER_PORT .env | cut -d '=' -f2 | tr -d '\r' | xargs)
        fi
        if [ -z "$FINAL_PORT" ] && [ -f .env-root ]; then
          FINAL_PORT=$(grep LEDGER_PORT .env-root | cut -d '=' -f2 | tr -d '\r' | xargs)
        fi
        if [ -z "$FINAL_PORT" ]; then
          FINAL_PORT="8000" 
        fi

        # 5. Run migrations and launch app with the verified port
        alembic upgrade head && uvicorn app.main:app --reload --port "$FINAL_PORT"
      '';
    };
  };

  enterShell = ''
    export VIRTUAL_ENV=$DEVENV_STATE/venv
    export PATH=$VIRTUAL_ENV/bin:$PATH
  '';

  scripts.migrate.exec = ''
    if [ -z "$1" ]; then
      echo "Usage: migrate 'message'"
    else
      alembic revision --autogenerate -m "$1"
    fi
  '';

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
    # identity.exec = "npx @stoplight/prism-cli mock ../interaction/contract.yml -p ${config.env.INTERACTION_PORT}";
    interaction = {
      exec = ''
      while ! pg_isready -d ${config.env.DB_NAME} -p 5433 > /dev/null 2>&1; do
        echo "Waiting for Postgres at localhost:5433..."
        sleep 1
      done
      sleep 3
      alembic upgrade head && uvicorn app.main:app --reload --port ${config.env.INTERACTION_PORT}
    '';
    };
    # ledger.exec = "npx @stoplight/prism-cli mock ../ledger/contract.yaml -p ${config.env.LEDGER_PORT}";
    # semantic.exec = "uvicorn main:app --reload --port ${config.env.SEMANTIC_PORT}";
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
