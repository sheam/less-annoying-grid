#!/usr/bin/bash

if [ ! -d "$1" ]; then
    echo "Please specify the directory of the application you will be testing less-annoying-grid with."
    echo "'$1' is not a valid directory'".
    exit 1
fi
APP_DIR="$1"


# prepare application
LAG="$PWD"

# unlink react
cd $APP_DIR

echo ">>> unregister react in app dir"
cd node_modules/react
yarn unlink

echo ">>> unlink module from application react instance"
cd $LAGyarn 
yarn unlink react

echo ">>> re-add react as a devDependancy"
yarn add react --dev --force

# unlink module
cd $APP_DIR

echo ">>> ulink less-annoying-grad from application"
yarn unlink less-annoying-grid
cd $LAG

echo ">>> unregister less-annoying-grid"
yarn unlink

# complete
echo "Module is not unlinked from $APP_DIR"