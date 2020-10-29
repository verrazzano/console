# Copyright (C) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

NAME:=console
DOCKER_IMAGE_NAME ?= ${NAME}-dev
DOCKER_IMAGE_TAG ?= local-$(shell git rev-parse --short HEAD)
KIND_KUBECONFIG ?= ${HOME}/.kube/config
GOOGLE_CHROME_VERSION=85.0.4183.83-1
CHROMEDRIVER_VERSION=85.0.4183.87
CREATE_LATEST_TAG=0
JET_CLI_VERSION=9.1.0
CLUSTER_NAME ?= console-integ
VZ_UITEST_CONFIG_TEMPLATE ?= $(shell pwd)/integtest/config.uitest.json
VERRAZZANO_REPO_PATH ?= $(shell pwd)/../verrazzano
NODEJS_VERSION=v14.7

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
	time npm install && \
	time npm install @oracle/ojet-cli@${JET_CLI_VERSION}

.PHONY: check-formatting
check-formatting: npm-install
	npm run prettier

.PHONY: lint-code
lint-code: check-formatting
	npm run eslint

.PHONY: unit-test
unit-test: npm-install
ifdef JENKINS_URL
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
	time ojet build --release

.PHONY: build
build: ojet-build
	time docker build --pull \
		-t ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} .

.PHONY: push
push: build
	docker tag ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} ${DOCKER_IMAGE_FULLNAME}:${DOCKER_IMAGE_TAG}
	docker push ${DOCKER_IMAGE_FULLNAME}:${DOCKER_IMAGE_TAG}

	if [ "${CREATE_LATEST_TAG}" == "1" ]; then \
		docker tag ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} ${DOCKER_IMAGE_FULLNAME}:latest; \
		docker push ${DOCKER_IMAGE_FULLNAME}:latest; \
	fi

.PHONY: setup-integ-test
setup-integ-test: build create-cluster
ifdef JENKINS_URL
	# install the yq 3.4.1 binary using go get - yum install gets an older version that does not have multi-doc yaml capability
	GO111MODULE=on go get github.com/mikefarah/yq/v3
	$${HOME}/go/bin/yq --version
endif
	echo "Running integ tests against image ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"
	CONSOLE_DOCKER_IMAGE=${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} \
	VERRAZZANO_REPO_PATH=${VERRAZZANO_REPO_PATH} \
	CLUSTER_NAME=${CLUSTER_NAME} \
	PATH=$${HOME}/go/bin:$${PATH} \
	./integtest/scripts/setup_integ_test.sh

.PHONY: integ-test
integ-test: setup-integ-test
ifdef JENKINS_URL
	google-chrome --version || (curl -o google-chrome.rpm "https://dl.google.com/linux/chrome/rpm/stable/x86_64/google-chrome-stable-${GOOGLE_CHROME_VERSION}.x86_64.rpm"; sudo yum install -y ./google-chrome.rpm)

	curl -o chromedriver.zip "https://chromedriver.storage.googleapis.com/${CHROMEDRIVER_VERSION}/chromedriver_linux64.zip"
	unzip chromedriver.zip
	sudo cp chromedriver /usr/local/bin/	
endif
	# create integ test config file with correct console url from KinD cluster
	./integtest/scripts/edit_integ_test_config.sh ${CLUSTER_NAME} ${VZ_UITEST_CONFIG_TEMPLATE} > tmp.uitestconfig.json
	export VERRAZZANO_REPO_PATH=${VERRAZZANO_REPO_PATH} && \
	export VZ_UITEST_CONFIG=tmp.uitestconfig.json && \
	export CONSOLE_DOCKER_IMAGE=${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} && \
	npm run integtest

.PHONY: create-cluster
create-cluster: delete-cluster
	echo 'Create cluster...'
	KIND_KUBECONFIG=${KIND_KUBECONFIG} \
	HTTP_PROXY="" HTTPS_PROXY="" http_proxy="" https_proxy="" \
	time ./integtest/scripts/create_cluster.sh ${CLUSTER_NAME}
	kubectl --kubeconfig ${KIND_KUBECONFIG} config set-context kind-${CLUSTER_NAME}
ifdef JENKINS_URL
	# Get the ip address of the container running the kube apiserver
	# and update the kubeconfig file to point to that address, instead of localhost
	sed -i -e "s|127.0.0.1.*|`docker inspect ${CLUSTER_NAME}-control-plane | jq '.[].NetworkSettings.IPAddress' | sed 's/"//g'`:6443|g" ${KIND_KUBECONFIG}
	cat ${KIND_KUBECONFIG} | grep server
endif

.PHONY: delete-cluster
delete-cluster:
	./integtest/scripts/delete_cluster.sh ${CLUSTER_NAME}
