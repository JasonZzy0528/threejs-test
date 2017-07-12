# set the base image to Ubuntu
# FROM debian:latest
FROM ubuntu:latest

# replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

USER root
# update the repository sources list
# and install dependencies
RUN apt-get update \
    && apt-get install -y \
#       curl \
#      git \
#      bzip2 \
#      ssh \
      build-essential \
RUN apt-get install -y --no-install-recommends libegl1-mesa-drivers
RUN apt-get install -y --no-install-recommends libxi-dev
RUN apt-get install -y --no-install-recommends libglu1-mesa-dev
RUN apt-get install -y --no-install-recommends libglew-dev
RUN apt-get install -y --no-install-recommends mesa-utils
RUN apt-get -y autoclean

RUN gcc --help
RUN glewinfo

# nvm environment variables
# ENV NVM_DIR /usr/local/nvm
# ENV NODE_VERSION 4.7.3
# ENV INSTALL_DIR /home/threejs-test

# Expose the application on port 3000
# EXPOSE 3000

# ADD docker-entrypoint.sh /
# RUN chmod +x /docker-entrypoint.sh

# install nvm
# https://github.com/creationix/nvm#install-script
# RUN curl --silent -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash

# install node and npm
# RUN source $NVM_DIR/nvm.sh \
#    && nvm install $NODE_VERSION \
#    && nvm alias default $NODE_VERSION \
#    && nvm use default

# add node and npm to path so the commands are available
# ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
# ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# confirm installation
# RUN node -v && npm -v && python -V &&

# ENTRYPOINT ["/docker-entrypoint.sh"]
