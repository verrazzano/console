# Copyright (C) 2020, Oracle and/or its affiliates.
NAME:=console
DOCKER_IMAGE_NAME ?= ${NAME}-dev
TAG:=$(shell git rev-parse HEAD)
DOCKER_IMAGE_TAG ?= ${TAG}
DOCKER_IMAGE_FULLNAME = ${DOCKER_REPO}/${DOCKER_NAMESPACE}/${DOCKER_IMAGE_NAME}
ifeq ($(DOCKER_IMAGE_TAG),)
        $(error DOCKER_IMAGE_TAG is undefined)
endif

PROXY_ARGS=
ifdef http_proxy
	PROXY_ARGS += --build-arg http_proxy=${http_proxy}
endif
ifdef https_proxy
	PROXY_ARGS += --build-arg https_proxy=${https_proxy}
endif
ifdef no_proxy
	PROXY_ARGS += --build-arg no_proxy=${no_proxy}
endif
ifdef HTTP_PROXY
	PROXY_ARGS += --build-arg HTTP_PROXY=${HTTP_PROXY}
endif
ifdef HTTPS_PROXY
	PROXY_ARGS += --build-arg HTTPS_PROXY=${HTTPS_PROXY}
endif
ifdef NO_PROXY
	PROXY_ARGS += --build-arg NO_PROXY=${NO_PROXY}
endif

.PHONY: ojet_build
ojet_build:
	npm config set "strict-ssl" false && \
	npm config set registry https://artifacthub-tip.oraclecorp.com/api/npm/npmjs-remote && \
	npm install && \
	npm install @oracle/ojet-cli && \
	PATH=./node_modules/.bin:${PATH} && \
	ojet build


.PHONY: build
build: ojet_build
	docker build \
	--no-cache \
	$(PROXY_ARGS) \
	-t ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} \
	-f Dockerfile \
	.

.PHONY: push
push: build
	docker tag ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} ${DOCKER_IMAGE_FULLNAME}:${DOCKER_IMAGE_TAG}
	docker push ${DOCKER_IMAGE_FULLNAME}:${DOCKER_IMAGE_TAG}

	if [ ${CREATE_LATEST_TAG} ]; then \
		docker tag ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} ${DOCKER_IMAGE_FULLNAME}:latest; \
		docker push ${DOCKER_IMAGE_FULLNAME}:latest; \
	fi