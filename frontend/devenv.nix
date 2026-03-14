{ pkgs, config, lib, ... }: {

  cachix.enable = false;

  #shows nice TUI
  process.manager.implementation = "process-compose";

  # loads .env
  dotenv.enable = true;

  packages = [ 
  ];
  
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_22;
    npm.enable = true;
    npm.install.enable = true; 
  };

  # processes
  processes = {
    frontend.exec = "npm run dev";
    backend.exec = "npx @stoplight/prism-cli mock ../backend/contract.yaml -p ${config.env.BACKEND_PORT}";
  };


  scripts.vue-setup.exec = ''
    if [ ! -f "package.json" ]; then
      npm create vue@latest
    else
      echo "Project exists. Ensuring dependencies are installed..."
      npm install
    fi
  '';

}
