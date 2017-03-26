#!/bin/bash
set -e

chmod 400 /root/.ssh/id_rsa
ssh-keyscan github.com > "/root/.ssh/known_hosts"

# Pull source from repo
if [ ! -d "${INSTALL_DIR}/.git" ]; then
    echo "Cloning your repository...."
    git clone -b docker git@github.com:JasonZzy0528/threejs-test.git ${INSTALL_DIR}
else
    echo "Building and serving site..."
    cd ${INSTALL_DIR}
    git pull -f
fi

cd ${INSTALL_DIR}
npm install
npm start
