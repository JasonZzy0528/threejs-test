#!/bin/bash
set -e

cd ${INSTALL_DIR}

echo "
{
  \"user\": \"${USER}\",
  \"database\": \"${DATABASE}\",
  \"password\": \"${PASSWORD}\",
  \"host\": \"${HOST}\",
  \"port\": ${PORT}
}" > ${INSTALL_DIR}/calculation/db/dbConfig.json

xvfb-run -s "-ac -screen 0 1280x1024x24" npm start
