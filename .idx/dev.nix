{ pkgs }: {
  channel = "stable-23.11";
  packages = [
    pkgs.nodejs_20
  ];
  idx.extensions = [

  ];
  idx.previews = {
    previews = [
    ];
  };
}
