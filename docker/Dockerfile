FROM ubuntu:latest

ENV DEBIAN_FRONTEND noninteractive
# nvm environment variables
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 4.7.3
ENV INSTALL_DIR /home/threejs-test

# replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# update the repository sources list
# and install dependencies
RUN apt-get update \
    && apt-get install -y curl \
                          git \
                          bzip2 \
                          ssh \
                          build-essential \
                          libxi-dev \
                          libglu1-mesa-dev \
                          libglew-dev \
                          python-dev \
                          python-pip \
                          mesa-utils \
                          xserver-xorg-video-all \
                          xvfb \
    && apt-get -y autoclean

# Expose the application on port 3000
EXPOSE 3000

ADD docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# install nvm
# https://github.com/creationix/nvm#install-script
RUN curl --silent -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash

# install node and npm
RUN source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# add node and npm to path so the commands are available
 ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
 ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

USER root

RUN git clone -b dev https://github.com/JasonZzy0528/threejs-test.git ${INSTALL_DIR}

WORKDIR ${INSTALL_DIR}

RUN npm install

ENTRYPOINT ["/docker-entrypoint.sh"]
