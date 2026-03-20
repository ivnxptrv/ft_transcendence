{ pkgs, config, lib, ... }: {
  
  cachix.enable = false;
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
    package = pkgs.postgresql_16;
    port = 5555;
    initialDatabases = [
      { name = "${config.env.DB_NAME}"; }
    ];
  };

  env.DATABASE_URL = "postgresql://${builtins.getEnv "USER"}@localhost:5555/${config.env.DB_NAME}?host=${config.env.DEVENV_RUNTIME}/postgres";

  tasks."db:setup" = {
    exec = ''
      rm -rf .devenv/state/postgres
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
  
  processes = {
    identity = {
      exec = "npx prisma migrate deploy && npx prisma generate  && PORT=${config.env.IDENTITY_PORT} npm run start:dev";
      process-compose = {
        depends_on.postgres.condition = "process_healthy";
      };
    };
    ledger.exec = "npx @stoplight/prism-cli mock ../ledger/contract.yaml -p ${config.env.LEDGER_PORT}";
    semantic.exec = "npx @stoplight/prism-cli mock ../semantic/contract.yaml -p ${config.env.SEMANTIC_PORT}";
    interaction.exec = "npx @stoplight/prism-cli mock ../interaction/contract.yaml -p ${config.env.INTERACTION_PORT}";
  };
}
