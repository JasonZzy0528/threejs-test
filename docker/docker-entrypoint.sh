#!/bin/bash
set -e

# Pull source from repo
if [ ! -d "${INSTALL_DIR}/.git" ]; then
    echo "Cloning your repository...."
    git clone -b docker https://github.com/JasonZzy0528/threejs-test.git ${INSTALL_DIR}
else
    echo "Building and serving site..."
    cd ${INSTALL_DIR}
    git pull -f
fi

cd ${INSTALL_DIR}

echo "
{
  \"user\": \"${USER}\",
  \"database\": \"${DATABASE}\",
  \"password\": \"${PASSWORD}\",
  \"host\": \"${HOST}\",
  \"port\": ${PORT}
}" > ${INSTALL_DIR}/calculation/db/dbConfig.json

npm install
#npm start
xvfb-run -s "-ac -screen 0 1280x1024x24" npm start
