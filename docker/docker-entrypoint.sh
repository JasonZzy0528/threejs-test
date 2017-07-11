#!/bin/bash
set -e

# Pull source from repo
if [ ! -d "${INSTALL_DIR}/.git" ]; then
    echo "Cloning your repository...."
    git clone -b dev https://github.com/JasonZzy0528/threejs-test.git ${INSTALL_DIR}
else
    echo "Building and serving site..."
    cd ${INSTALL_DIR}
    git pull -f
fi

cd ${INSTALL_DIR}
npm install
npm start
