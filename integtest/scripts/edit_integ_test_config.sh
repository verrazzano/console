#!/bin/bash
#
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
#
# Edit a given input test configuration file and replace the URL with the KinD cluster console nodeport URL. 
# Also disable test login in the config

if [ $# -ne 2 ]; then
  echo "Usage $0 <KinD cluster name> <input config file>"
  exit 1
fi
CLUSTER_NAME=$1
INPUT_CONFIG_FILE=$2

export WORKER_IP=$(kubectl get node ${CLUSTER_NAME}-worker -o json | jq -r '.status.addresses[] | select (.type=="InternalIP") | .address')
export CONSOLE_NODEPORT=$(kubectl get svc console -o json -n verrazzano-system | jq -r '.spec.ports[].nodePort')
export CONSOLE_URL="http://${WORKER_IP}:${CONSOLE_NODEPORT}"
cat ${INPUT_CONFIG_FILE} | jq  --arg url "${CONSOLE_URL}" '.driverInfo.url = $url | .loginEnabled = false' 
