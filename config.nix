{ inputs, ... }:
{
  imports = [
    inputs.flake-parts.flakeModules.modules
  ];

  config = {
    systems = [
      "x86_64-linux"
      "aarch64-linux"
      "x66_64-darwin"
      "aarch64-darwin"
    ];
  };

}
