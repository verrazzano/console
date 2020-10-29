#!/bin/bash
#
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
#
# Create Kind cluster with specified name for integration tests

KINDEST_NODE_IMAGE="kindest/node:v1.16.9@sha256:7175872357bc85847ec4b1aba46ed1d12fa054c83ac7a8a11f5c268957fd5765";
SCRIPT_DIR=$(dirname $0)
if [ $# -ne 1 ]; then
  echo "Usage $0 <cluster name>"
  exit 1
fi

KIND_CLUSTER_NAME=$1
if [ -z "$KIND_KUBECONFIG" ]; then
  KIND_KUBECONFIG=$HOME/.kube/config
fi

echo "Creating KinD cluster ${KIND_CLUSTER_NAME}. The kubeconfig file will be saved at ${KIND_KUBECONFIG}."
kind create cluster \
                --name ${KIND_CLUSTER_NAME} \
                --wait 5m \
                --image $KINDEST_NODE_IMAGE \
                --config=integtest/kind/kind_config.yaml \
                --kubeconfig ${KIND_KUBECONFIG}