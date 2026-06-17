{ pkgs, ... }: {
  # Define processes that run the devenv up command in each subfolder
  processes = {
      identity.exec = "cd ./services/identity && devenv up";
      ledger.exec = "cd ./services/ledger && devenv up";
      interaction.exec = "cd ./services/interaction && devenv up";
      semantic.exec = "cd ./services/semantic && devenv up";
      web.exec = "cd ./web && devenv up";
  };
}
