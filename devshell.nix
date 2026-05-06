{ inputs, ... }:
{
  perSystem = { pkgs, ...  }: 
    let
      pkgs' = import inputs.nixpkgs {
        inherit (pkgs.stdenv.hostPlatform) system;
        config.allowUnfree = true;
      };
    in {
      devShells.default = pkgs'.mkShell {
        packages = with pkgs'; [
          deno
          nil
          claude-code
        ];
      };
    };
}
