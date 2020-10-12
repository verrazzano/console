#!/bin/bash
#
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
#
ROOT_DIR="$(cd $(dirname "${BASH_SOURCE}")/.. && pwd -P)"
. "${ROOT_DIR}/scripts/common.sh"

function create_cluster {
  ${KIND_BIN} create cluster --name=${CLUSTER_NAME} --image=kindest/node:${KINDEST_NODE_VERSION} --config=${ROOT_DIR}/kind/kind_config.yaml
  create_kubeconfig
  echo "\nKubernetes cluster ${CLUSTER_NAME} created."
}

function install_ingress_controller {
  kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/static/provider/kind/deploy.yaml
  kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
}

function clone_verrazzano {
  git clone --branch develop https://github.com/verrazzano/verrazzano.git 
}

function install_operator {
  cd ${TMP_DIR}
  clone_verrazzano
  cd verrazzano/install/chart
  ls -lahrt
  helm template verrazzano . --show-only templates/01-verrazzano-operator.yaml --set verrazzanoAdmissionController.caBundle="" > ${TMP_DIR}/operator.yaml
  #yq -yi '(.spec.containers[].env[]|select(.name == "MONGO_HOST").value)|="172.16.87.98"'
  #yq -yi '.spec|(select(.template != null)|.template.spec.containers[]|select(.name == "verrazzano-operator").args|. + ["--startController=false"])' ${TMP_DIR}/operator.yaml 

}

create_tmp_dir
download_kind
create_cluster
install_ingress_controller
install_operator