{ pkgs, config, lib, ... }: {
  cachix.enable = false;
  
  # loads .env

  env = {
    LEDGER_PORT = "4011"; # Set to your desired port
    DB_NAME = "ledger_db";     # Matches your initialDatabases config
    # Add other variables here as needed
  };

  dotenv.enable = true;
  dotenv.filename = [
    ".env-root" # Dir above
    ".env"      # Current dir
  ];
  
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
    port = 5433; 
    package = pkgs.postgresql_16; 
    initialDatabases = [
      { name = "ledger_db"; }
      { name = "user"; }
    ];
    # Forces Postgres to listen on TCP/IP so DBeaver can connect over localhost:5432
    settings.listen_addresses = pkgs.lib.mkForce "127.0.0.1";
  };

  # Safe static env fallback 
  env.DATABASE_URL = "postgresql+asyncpg://user@127.0.0.1:5433/ledger_db";

  processes = {
    ledger = {
      exec = ''
        # 1. Wait for Postgres
        while ! pg_isready -h localhost -p 5433 > /dev/null 2>&1; do
          echo "Waiting for Postgres at localhost:5433..."
          sleep 1
        done

        # 2. ADD THIS LINE: It tells Python to look in the current folder for 'app'
        export PYTHONPATH=$PYTHONPATH:$PWD
      
        sleep 3
      
        # 3. Run migration and start the server
        alembic upgrade head && uvicorn app.main:app --reload --host 127.0.0.1 --port $LEDGER_PORT
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
}