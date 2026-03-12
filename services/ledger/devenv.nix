{ pkgs, config, lib, ... }: {

  cachix.enable = false;

  #shows nice TUI
  process.manager.implementation = "process-compose";

  # loads .env
  dotenv.enable = true;
  
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_22;
    npm.enable = true;
    npm.install.enable = true; 
  };

  packages = [
      pkgs.nodePackages."@nestjs/cli"
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
    identity.exec = "npx @stoplight/prism-cli mock ../identity/contract.yaml -p ${config.env.IDENTITY_PORT}";
    ledger.exec = "npm run start:dev";
    semantic.exec = "npx @stoplight/prism-cli mock ../semantic/contract.yaml -p ${config.env.SEMANTIC_PORT}";
    interaction.exec = "npx @stoplight/prism-cli mock ../interaction/contract.yaml -p ${config.env.INTERACTION_PORT}";
  };

  tasks."db:setup" = {
    exec = ''
      echo "Wiping database state for a fresh start..."
      rm -rf .devenv/state/postgres
      sleep 5
    '';
    before = [ "devenv:processes:postgres" ];
  };

  scripts.nest-setup.exec = ''
    if [ ! -f "package.json" ]; then
      echo "No package.json found. Scaffolding new NestJS project..."
      nest new . --package-manager npm --skip-git
    else
      echo "Project exists. Ensuring dependencies are installed..."
      npm install
    fi
  '';

}
