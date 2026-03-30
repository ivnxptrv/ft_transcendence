{ pkgs, config, lib, ... }: {
  cachix.enable = false;
  process.manager.implementation = "process-compose";
  dotenv.enable = true;

  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_22;
    npm.enable = true;
    npm.install.enable = true;
  };

  packages = [
    pkgs.nodePackages."@nestjs/cli"
    pkgs.prisma-engines
    pkgs.openssl
  ];

  services.postgres = {
    enable = true;
    port = 5434;
    package = pkgs.postgresql_16;
    initialDatabases = [
      { name = "${config.env.DB_NAME}"; }
    ];
  };

  env.DATABASE_URL = "postgresql://${builtins.getEnv "USER"}@localhost:5434/${config.env.DB_NAME}?host=${config.env.DEVENV_RUNTIME}/postgres";

  tasks."db:setup" = {
    exec = ''
      rm -rf .devenv/state/postgres
    '';
    before = [ "devenv:processes:postgres" ];
  };

  processes = {
    interaction = {
      exec = "npx prisma migrate deploy && npx prisma generate && PORT=${config.env.INTERACTION_PORT} npm run start:dev";
      process-compose = {
        depends_on.postgres.condition = "process_healthy";
      };
    };
    identity.exec = "npx @stoplight/prism-cli mock -d ../identity/contract.yaml -p ${config.env.IDENTITY_PORT}";
    ledger.exec = "npx @stoplight/prism-cli mock ../ledger/contract.yaml -p ${config.env.LEDGER_PORT}";
    semantic.exec = "npx @stoplight/prism-cli mock ../semantic/contract.yaml -p ${config.env.SEMANTIC_PORT}";
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