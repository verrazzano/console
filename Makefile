# Copyright (C) 2020, 2021, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

NAME:=console
DOCKER_IMAGE_NAME ?= ${NAME}-dev
DOCKER_IMAGE_TAG ?= local-$(shell git rev-parse --short HEAD)
KIND_KUBECONFIG ?= ${HOME}/.kube/config
GOOGLE_CHROME_VERSION=90.0.4430.93-1
CREATE_LATEST_TAG=0
JET_CLI_VERSION=10.1.0
CLUSTER_NAME ?= console-integ
VZ_UITEST_CONFIG_TEMPLATE ?= $(shell pwd)/integtest/config.uitest.json
VERRAZZANO_REPO_PATH ?= $(shell pwd)/../verrazzano

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

.PHONY: npm-install
npm-install:
	echo NodeJS version is $(shell node --version)
	npm ci
ifndef JENKINS_URL
	npm ci @oracle/ojet-cli@${JET_CLI_VERSION}
endif

.PHONY: check-formatting
check-formatting: npm-install
	npm run prettier

.PHONY: lint-code
lint-code: check-formatting
	npm run eslint

.PHONY: unit-test
unit-test: npm-install
ifndef JENKINS_URL
	curl -o google-chrome.rpm "https://dl.google.com/linux/chrome/rpm/stable/x86_64/google-chrome-stable-${GOOGLE_CHROME_VERSION}.x86_64.rpm"
	sudo yum install -y ./google-chrome.rpm
endif
	export PATH=./node_modules/.bin:${PATH} && \
	ojet build && \
	pwd && \
	ls -l node_modules/\@oracle/oraclejet/dist/types/ojmodel && \
	ls -l web/js/libs/oj
	echo $$PATH
	sudo env "PATH=$$PATH" npm test

.PHONY: ojet-build
ojet-build: npm-install
	PATH=./node_modules/.bin:${PATH} && \
	ojet build --release
	./calc_integrity_hash.sh

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

.PHONY: run-ui-tests
run-ui-tests: npm-install
	./integtest/scripts/edit_integ_test_config.sh ${VZ_UITEST_CONFIG_TEMPLATE} > tmp.uitestconfig.json
	export VZ_UITEST_CONFIG=tmp.uitestconfig.json && \
	npm run integtest

.PHONY: run-app-page-test
run-app-page-test: npm-install
	./integtest/scripts/edit_integ_test_config.sh ${VZ_UITEST_CONFIG_TEMPLATE} > tmp.uitestconfig.json
	export VZ_UITEST_CONFIG=tmp.uitestconfig.json && \
	npm run app-page-test
