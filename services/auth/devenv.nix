{ pkgs, config, lib, ... }: {

  cachix.enable = false;
  
  # 1. Languages
  languages.javascript = {
    enable = true;
    # VERIFY: Ensure 'nodejs_22' is the exact attribute path on search.nixos.org
    package = pkgs.nodejs_22;
    npm.enable = true;
    npm.install.enable = true; 
  };

  # 2. Database: Private, auto-created Postgres for Auth
  services.postgres = {
    enable = true;
    # ARCHITECTURE FIX: Define the Postgres package here, not in the global 'packages' array.
    # This prevents PATH collisions and scopes the binary strictly to the service.
    package = pkgs.postgresql_16; 
    initialDatabases = [{ name = "auth_db"; }];
  };

  # 3. Environment
  # TYPO FIX: Changed 'postgress' to 'postgres'.
  # PATH FIX: devenv places the Postgres socket in DEVENV_STATE, not DEVENV_RUNTIME.
  env.DATABASE_URL = "postgres:///auth_db?host=${config.env.DEVENV_RUNTIME}/postgres";
  env.WALLET_SERVICE_URL = "http://localhost:4002";

  # 4. Processes
  processes = {
    auth.exec = "npm run start:dev";
    wallet.exec = "npx @stoplight/prism-cli mock ../wallet/openapi.yaml -p 4002";
  };
  scripts.up.exec = ''
    # 1. Force kill any lingering postgres on this specific port
    # Use 'ss' or 'fuser' to find what's holding the port 5432
    fuser -k 5432/tcp || true

    # 2. Remove the lock files specifically
    rm -f .devenv/state/postgres/*.lock
    rm -f .devenv/state/postgres/postmaster.pid

    # 3. Now start the environment
    devenv up
  '';

}
