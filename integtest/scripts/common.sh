#!/bin/bash
#
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
#
ROOT_DIR="$(cd $(dirname "${BASH_SOURCE}")/.. && pwd -P)"
TMP_DIR="${ROOT_DIR}/.tmp"
KIND_VERSION="v0.9.0"
KIND_BIN=${TMP_DIR}/kind-${KIND_VERSION}
KUBECONFIG=${TMP_DIR}/kubeconfig
ARCH=$(uname | awk '{print tolower($0)}')
CLUSTER_NAME="integ-test-cluster"
KINDEST_NODE_VERSION="v1.19.1"

function create_tmp_dir { 
    mkdir -p ${TMP_DIR}
}

function download_kind { 
    KIND_URL="https://github.com/kubernetes-sigs/kind/releases/download/${KIND_VERSION}/kind-${ARCH}-amd64"
    echo "\nDownloading kind.."
    wget -nc -O ${KIND_BIN} ${KIND_URL}
    chmod +x ${KIND_BIN}
    ${KIND_BIN} version
}

function create_kubeconfig {
    ${KIND_BIN} get kubeconfig --name ${CLUSTER_NAME} > ${TMP_DIR}/kubeconfig
}

