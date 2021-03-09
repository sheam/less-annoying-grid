#!/usr/bin/bash

if [ ! -d "$1" ]; then
    echo "Please specify the directory of the application you will be testing less-annoying-grid with."
    echo "'$1' is not a valid directory'".
    exit 1
fi
APP_DIR="$1"

# prepare this project
echo ">>> remove react dependency from less-annoying-grid devDeps"
yarn remove react

echo ">>> register less-annoying-grid module"
yarn link
LAG="$PWD"

# prepare application
cd $APP_DIR
yarn install

echo ">>> link app to less-annoying-grid project"
yarn link less-annoying-grid
cd node_modules/react

echo ">>> register the applications react"
yarn link

# link reach from app to this module
cd $LAG
echo ">>> link less-annoying-grid to the applications react instance"
yarn link react

echo ">>>>>>> Run 'yarn watch' in this folder while developing."