#!/bin/bash

set -e
set -x

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate

cd third_party

if ! pip3 list | grep conan > /dev/null; then
  pip3 install conan==2.7.1
  conan config install -t dir conan-config
  conan profile detect --force
fi

cd CuraEngine
conan install . -pr:h cura_wasm.jinja --build=missing --update
cmake --preset conan-emscripten-release
cmake --build --preset conan-emscripten-release
cd ..

mkdir -p ../dist/compiled
cp CuraEngine/build/emscripten/Release/CuraEngine.js ../dist/compiled/CuraEngine.mjs