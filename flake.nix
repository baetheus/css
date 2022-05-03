{
  description = "A CSS library";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils/master";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };

        css = with pkgs; derivation {
          inherit system;
          name = "css";
          src = ./src;
          builder = "${dash}/bin/dash";
          args = ["-c" "${nodePackages.sass}/bin/sass $src:$out"];
        }; 

        examples = with pkgs; derivation {
          inherit system css;
          name = "css-examples";
          examples = ./examples;
          cp = "${coreutils}/bin/cp";
          mkdir = "${coreutils}/bin/mkdir";
          chmod = "${coreutils}/bin/chmod";
          server = "${simple-http-server}/bin/simple-http-server";
          builder = "${dash}/bin/dash";
          args = ["-c" "$mkdir $out; $cp -R $examples/* $css/* $out; echo \"$server -i $out\" > $out/run; $chmod +x $out/run;"];
        };

        examples-app = { type = "app"; program = "${examples}/run"; };
      in {
        /* The raw css files generated by sass */
        packages.css = css;

        /* The examples directory, generated css files, and a shell script that
        runs a local http server */
        packages.examples = examples;
         
        /* The default package is css */
        packages.default = css;
        defaultPackage = css;
          
        /* The default app runs the examples server */
        apps.examples = examples-app;
        apps.default = examples-app;
        defaultApp = examples-app;
      }
    );
}
