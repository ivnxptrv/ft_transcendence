{ pkgs, config, lib, ... }: {

  # loads .env
  dotenv.enable = true;
  dotenv.filename = [
      ".env-root"  # Dir above
      ".env"     # Current dir
    ];
  
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_22;
    npm.enable = true;
    npm.install.enable = true; 
  };

  packages = [
    ];

  # processes
  processes = {
    backend.exec = "PORT=${config.env.BACKEND_PORT} npm run dev -- --turbo"; 
    # identity.exec = "npx @stoplight/prism-cli mock ../services/identity/contract.yaml -p ${config.env.IDENTITY_PORT}";
    # ledger.exec = "npx @stoplight/prism-cli mock ../services/ledger/contract.yaml -p ${config.env.LEDGER_PORT}";
    # semantic.exec = "npx @stoplight/prism-cli mock ../services/semantic/contract.yaml -p ${config.env.SEMANTIC_PORT}";
    # interaction.exec = "npx @stoplight/prism-cli mock ../services/interaction/contract.yaml -p ${config.env.INTERACTION_PORT}";
  };

  scripts.next-setup.exec = ''
    if [ ! -f "package.json" ]; then
      echo "No package.json found. Scaffolding new Next.js project..."
      # Uses the official create-next-app non-interactively
      npx create-next-app@latest . \
        --ts \
        --tailwind \
        --eslint \
        --app \
        --src-dir \
        --import-alias "@/*" \
        --use-npm \
        --skip-install
      
      npm install
    else
      echo "Project exists. Ensuring dependencies are installed..."
      npm install
    fi
  '';

}
