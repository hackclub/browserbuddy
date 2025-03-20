#!/bin/bash

set -e
set -x

# this script would be called from the github actions workflow
rm -rf dist

#run other build scripts
scripts/build_cura.sh
scripts/bundle_resources.sh
npm i
npm run build:prod

#get list of subdirs to index
dist_subdirs="$(find dist -mindepth 1 -type d)"
http_port=5002

#spawn a local static file server
cd dist
python3 -m http.server "$http_port" &
cd ..
sleep 1

#fetch and save the file indexes of all the subdirectories
for subdir in $dist_subdirs; do
  if [ -f "$subdir/index.html" ]; then
    continue
  fi
  http_path="$(echo "$subdir" | cut -d'/' -f2-)/"
  curl "http://127.0.0.1:$http_port/$http_path" -o "$subdir/index.html"
done

#kill that http server we spawned
kill $(jobs -p)