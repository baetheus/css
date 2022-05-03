{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils/master";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        name = "css";
        css = with pkgs; derivation {
          inherit name system;
          src = ./src;
          builder = "${dash}/bin/dash";
          args = ["-c" "${nodePackages.sass}/bin/sass $src:$out"];
        }; 
      in {
        packages.css = css;

        devShell = with pkgs; mkShell {
          buildInputs = [
            dash
            nodePackages.sass
          ];
        };
      }
    );
}
