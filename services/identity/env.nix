{ pkgs, config, ... }: {
  
  # Identity-specific packages
  packages = [ pkgs.nodejs_20 ];

  # Identity-specific database needs
  services.postgres = {
    enable = true;
    initialDatabases = [{ name = "identity_db"; }];
  };

  # Identity-specific processes
  processes = {
    api.exec = ''
      set -a
      [ -f .env ] && source .env
      set +a
      npm run start:dev
    '';
  };
}
