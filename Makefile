# Copyright (C) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

NAME:=console
DOCKER_IMAGE_NAME ?= ${NAME}-dev
DOCKER_IMAGE_TAG ?= local-$(shell git rev-parse --short HEAD)
GOOGLE_CHROME_VERSION=85.0.4183.83-1
CREATE_LATEST_TAG=0

ifeq ($(MAKECMDGOALS),$(filter $(MAKECMDGOALS),push))
	ifndef DOCKER_REPO
		$(error DOCKER_REPO must be defined as the name of the docker repository where image will be pushed)
	endif
	ifndef DOCKER_NAMESPACE
		$(error DOCKER_NAMESPACE must be defined as the name of the docker namespace where image will be pushed)
	endif
	ifndef DOCKER_IMAGE_NAME
		$(error DOCKER_IMAGE_NAME must be defined as the name of the docker image that will be pushed)
	endif
	DOCKER_IMAGE_FULLNAME = ${DOCKER_REPO}/${DOCKER_NAMESPACE}/${DOCKER_IMAGE_NAME}
endif

.PHONY: all
all: build

.PHONY: setup-npm
setup-npm:
	sudo yum install -y bzip2
	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
	export NVM_DIR="$$HOME/.nvm" && \
	[ -s "$$NVM_DIR/nvm.sh" ] && \. "$$NVM_DIR/nvm.sh" && \
	nvm install 14.7 && \
	npm install && \
	npm install @oracle/ojet-cli

.PHONY: check-formatting
check-formatting: setup-npm
	npm run prettier

.PHONY: lint-code
lint-code: check-formatting
	npm run eslint

.PHONY: unit-test
unit-test: setup-npm
	curl -o google-chrome.rpm "https://dl.google.com/linux/chrome/rpm/stable/x86_64/google-chrome-stable-${GOOGLE_CHROME_VERSION}.x86_64.rpm"
	sudo yum install -y ./google-chrome.rpm
	export NVM_DIR="$$HOME/.nvm" && \
	[ -s "$$NVM_DIR/nvm.sh" ] && \. "$$NVM_DIR/nvm.sh" && \
	export PATH=./node_modules/.bin:${PATH} && \
	nvm use 14.7 && \
	ojet build && \
	pwd && \
	ls -l node_modules/\@oracle/oraclejet/dist/types/ojmodel && \
	ls -l web/js/libs/oj
	echo $$PATH
	sudo env "PATH=$$PATH" npm test

.PHONY: ojet-build
ojet-build: setup-npm
	export NVM_DIR="$$HOME/.nvm" && \
	[ -s "$$NVM_DIR/nvm.sh" ] && \. "$$NVM_DIR/nvm.sh" && \
	PATH=./node_modules/.bin:${PATH} && \
	nvm use 14.7 && \
	ojet build --release

.PHONY: build
build: ojet-build
	docker build --pull \
		-t ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} .

.PHONY: push
push: build
	docker tag ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} ${DOCKER_IMAGE_FULLNAME}:${DOCKER_IMAGE_TAG}
	docker push ${DOCKER_IMAGE_FULLNAME}:${DOCKER_IMAGE_TAG}

	if [ "${CREATE_LATEST_TAG}" == "1" ]; then \
		docker tag ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} ${DOCKER_IMAGE_FULLNAME}:latest; \
		docker push ${DOCKER_IMAGE_FULLNAME}:latest; \
	fi
