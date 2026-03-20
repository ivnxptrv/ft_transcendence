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
    package = pkgs.postgresql_16;
    initialDatabases = [
      { name = "${config.env.DB_NAME}"; }
    ];
  };

  env.DATABASE_URL = "postgresql://${builtins.getEnv "USER"}@localhost/${config.env.DB_NAME}?host=${config.env.DEVENV_RUNTIME}/postgres";

  processes = {
    identity = {
      # Chain the migration and the server start together
      exec = "npx prisma migrate deploy && PORT=${config.env.IDENTITY_PORT} npm run start:dev";
      process-compose = {
        depends_on.postgres.condition = "process_healthy";
      };
    };
    ledger.exec = "npx @stoplight/prism-cli mock ../ledger/contract.yaml -p ${config.env.LEDGER_PORT}";
    semantic.exec = "npx @stoplight/prism-cli mock ../semantic/contract.yaml -p ${config.env.SEMANTIC_PORT}";
    interaction.exec = "npx @stoplight/prism-cli mock ../interaction/contract.yaml -p ${config.env.INTERACTION_PORT}";
  };

  tasks."db:setup" = {
    exec = ''
      echo "Wiping database state for a fresh start..."
      rm -rf .devenv/state/postgres
      rm -rf ./${config.env.DEVENV_RUNTIME}/postgres
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
enterShell = ''
  export PRISMA_SCHEMA_ENGINE_BINARY="${pkgs.prisma-engines}/bin/schema-engine"
  export PRISMA_QUERY_ENGINE_BINARY="${pkgs.prisma-engines}/bin/query-engine"
  export PRISMA_QUERY_ENGINE_LIBRARY="${pkgs.prisma-engines}/lib/libquery_engine.node"
  export PRISMA_INTROSPECTION_ENGINE_BINARY="${pkgs.prisma-engines}/bin/introspection-engine"
  export PRISMA_FMT_ENGINE_BINARY="${pkgs.prisma-engines}/bin/prisma-fmt"
'';
}
