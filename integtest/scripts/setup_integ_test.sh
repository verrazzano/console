#
# Copyright (c) 2020, 2021, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
#
# Set up a KinD cluster for integration test use

LOG_LEVEL=DEBUG

if [ -z "$CLUSTER_NAME" ]; then
  echo "The name of the KinD cluster to use must be specified in environment variable CLUSTER_NAME"
  exit 1
fi

if [ -z "$VERRAZZANO_REPO_PATH" ]; then
  echo "The location of the verrazzano repo should be specified in environment variable VERRAZZANO_REPO_PATH"
  exit 1
fi

if [ -z "$CONSOLE_DOCKER_IMAGE" ]; then
  echo "The console docker image to be used should be specified in the format <image name>:<tag>, in the environment variable CONSOLE_DOCKER_IMAGE"
  exit 1
fi

SCRIPT_DIR=$(dirname $0)
VZ_NAMESPACE=verrazzano-system
CONSOLE_MANIFEST="${SCRIPT_DIR}/../kind/console_manifest.yaml"
VZ_OPERATOR_NODEPORT_YAML="${SCRIPT_DIR}/../kind/verrazzano-operator-nodeport.yaml"
VZ_HELM_CHART_DIR="${VERRAZZANO_REPO_PATH}/platform-operator/scripts/install/chart";
VZ_OPERATOR_HELM_TEMPLATE="${VZ_HELM_CHART_DIR}/templates/01-verrazzano-operator.yaml";
TMP_INTEG_DIR=$(mktemp -d) || exit 1

. $SCRIPT_DIR/utils.sh

function deploy_crds() {
  local verrazzanoHelmChartDir="${VERRAZZANO_REPO_PATH}/platform-operator/scripts/install/chart"
  local modelCrdFile="${verrazzanoHelmChartDir}/crds/verrazzano.io_verrazzanomodels_crd.yaml";
  local bindingCrdFile="${verrazzanoHelmChartDir}/crds/verrazzano.io_verrazzanobindings_crd.yaml";
  local monitoringInstCrdFile="${verrazzanoHelmChartDir}/crds/verrazzano.io_verrazzanomonitoringinstances_crd.yaml";
  local vmcCrdFile="${verrazzanoHelmChartDir}/crds/verrazzano.io_verrazzanomanagedclusters_crd.yaml";
  local KUBECTL_ERR
  local kubectlStatus=0

  # tolerate AlreadyExists errors
  echo "Creating Verrazzano Model CRD from file ${modelCrdFile}";
  kubectlErr=$(kubectl create -f $modelCrdFile 2>&1)
  if [ $? -ne 0 ] && [ "$(echo $kubectlErr | grep AlreadyExists)" == "" ]; then
      kubectlStatus=1
  fi
  consoleerr $kubectlErr

  echo
  echo "Creating Verrazzano Binding CRD from file ${bindingCrdFile}"
  kubectlErr=$(kubectl create -f $bindingCrdFile 2>&1)
  if [ $? -ne 0 ] && [ "$(echo $kubectlErr | grep AlreadyExists)" == "" ]; then
      kubectlStatus=1
  fi
  consoleerr $kubectlErr

  echo
  echo "Creating Verrazzano Monitoring Instances CRD from file ${monitoringInstCrdFile}"
  kubectlErr=$(kubectl create -f $monitoringInstCrdFile 2>&1)
  if [ $? -ne 0 ] && [ "$(echo $kubectlErr | grep AlreadyExists)" == "" ]; then
      kubectlStatus=1
  fi
  consoleerr $kubectlErr

  echo
  echo "Creating Verrazzano Managed Clusters CRD from file ${vmcCrdFile}"
  kubectlErr=$(kubectl create -f $vmcCrdFile 2>&1)
  if [ $? -ne 0 ] && [ "$(echo $kubectlErr | grep AlreadyExists)" == "" ]; then
    kubectlStatus=1
  fi

  consoleerr $kubectlErr
  return $kubectlStatus
}

function find_index_of_deployment() {
  local multiYamlFile=$1
  find_index_in_multi_doc_yaml $multiYamlFile 'kind' 'Deployment'
  return $?
}

function find_index_of_service() {
  local multiYamlFile=$1
  find_index_in_multi_doc_yaml $multiYamlFile 'kind' 'Service'
  return $?
}

function edit_verrazzano_operator_manifest() {
  local vzEditedManifest=$1
  local consoleURL=$2
  local deployIdx=$(find_index_of_deployment $vzOperatorManifest)
  if [ $? -ne 0 ] || [ -z "$deployIdx" ]; then
    consoleerr "Could not find a Deployment in the verrazzano-operator manifest file $vzOperatorManifest"
    return 1
  fi
  consoledebug "Deployment located at $deployIdx in the verrazzano-operator manifest"

  # add the startController flag to the args of the verrazzano-operator container and set it to false
  add_deployment_container_arg $vzEditedManifest $deployIdx 0 "--startController=false" || return 1

  # Set the apiServerRealm to empty to disable auth
  local argsArray=($(yq r -d $deployIdx $vzOperatorManifest 'spec.template.spec.containers[0].args.*'))
  local apiServerRealmIdx=$(find_index_of_item_in_array '--apiServerRealm' "${argsArray[@]}" )
  if [ $? -eq 0 ]; then
    # found existing apiServerRealm arg - update it to empty to turn off auth in the vz operator
    local realmVal=$(yq r -d $deployIdx $vzOperatorManifest "spec.template.spec.containers[0].args[$apiServerRealmIdx]") #TODO remove prints the value
    consoledebug "Replacing apiServerRealm arg in deployment at args index $apiServerRealmIdx, current value is: ${realmVal}"

    yq w -i -d $deployIdx $vzEditedManifest -- \
      "spec.template.spec.containers[0].args[$apiServerRealmIdx]" "--apiServerRealm=" || return 1
  else
    # did not find apiServerRealm arg - add it to the list of args
    add_deployment_container_arg $vzEditedManifest $deployIdx 0 "--apiServerRealm=" || return 1
  fi

  local corsEnvIdx=$(find_deployment_container_env $vzEditedManifest $deployIdx 0 "ACCESS_CONTROL_ALLOW_ORIGIN")
  if [ -z "$corsEnvIdx" ]; then
    # did not find existing env var, add it to the list of env vars at the last+1 index (i.e. length of array)
    add_deployment_container_env $vzEditedManifest $deployIdx 0 "ACCESS_CONTROL_ALLOW_ORIGIN" "$consoleURL" || return 1
  else
    # found existing env var, set the value to console URL so that CORS requests are permitted from console
    consoleerr "Replacing cors env var at index $corsEnvIdx"
    yq w -i -d $deployIdx $vzEditedManifest -- \
      "spec.template.spec.containers[0].env[$corsEnvIdx].value" "$consoleURL" || return 1
  fi
  consoleerr "Done editing $vzEditedManifest"
  return 0
}

function deploy_verrazzano_operator() {
  if [ $# -ne 1 ]; then
    consoleerr "Cannot deploy verrazzano-operator without specifying console URL!"
    return 1
  fi
  local consoleURL=$1

  local vzOperatorManifest
  local vzEditedManifest
  local vzOperatorImage

  vzOperatorManifest=$(create_verrazzano_operator_manifest)
  if [ $? -ne 0 ]; then
    consoleerr "Failed to create verrazzano-operator manifest"
    return 1
  fi
  consoleerr "Created verrazzano-operator manifest"

  vzEditedManifest="$(dirname $vzOperatorManifest)/verrazzano-edited-manifest.yaml"
  cp $vzOperatorManifest $vzEditedManifest

  edit_verrazzano_operator_manifest $vzEditedManifest $consoleURL

  local deployIdx=$(find_index_of_deployment $vzEditedManifest)
  vzOperatorImage=$(yq r -d $deployIdx $vzEditedManifest 'spec.template.spec.containers[0].image')
  if [ -z "$vzOperatorImage" ]; then
    consoleerr "Could not find verrazzano-operator image in $vzEditedManifest"
  fi

  consoleerr
  # pull and load the verrazzano-operator docker image into KinD cluster
  docker pull $vzOperatorImage || return 1

  consoleerr
  kind load docker-image --name ${CLUSTER_NAME} ${vzOperatorImage} || return 1

  # Now deploy the verrazzano operator
  consoleerr
  consoleerr "Deploying verrazzano-operator to KinD cluster ${CLUSTER_NAME}"
  kubectl apply -f $vzEditedManifest || return 1

  consoleerr "Creating NodePort service for verrazzano-operator"
  kubectl apply -f ${VZ_OPERATOR_NODEPORT_YAML} || return 1

  consoleerr
  consoleerr "Waiting for verrazzano-operator pod to reach ready state"
  kubectl -n ${VZ_NAMESPACE} wait --for=condition=ready pods -l app=verrazzano-operator --timeout 2m

  return 0
}

function create_verrazzano_operator_manifest() {
  local helmDir=$TMP_INTEG_DIR/helmTemplates
  mkdir $helmDir
  consoleerr "Copying verrazzano-operator Helm chart to temp dir ${helmDir}"
  local templatesDir=$helmDir/templates
  mkdir $templatesDir
  cp $VZ_OPERATOR_HELM_TEMPLATE $templatesDir || return 1
  cp $VZ_HELM_CHART_DIR/values.yaml $helmDir || return 1
  cp $VZ_HELM_CHART_DIR/Chart.yaml $helmDir || return 1

  # Replace the values from the Helm chart to create a Kubernetes manifest file for the
  # verrazzano-operator at the specified output location
  local vzOperatorManifest=$helmDir/verrazzano-operator-manifest.yaml
  helm template verrazzano $helmDir --namespace ${VZ_NAMESPACE} \
    --set image.pullPolicy=IfNotPresent \
    --set config.envName=default --set config.dnsSuffix=dummy.verrazzano.io \
    > $vzOperatorManifest || return 1

  # The manifest file location is printed to stdout so that caller can read it from stdout
  echo $vzOperatorManifest
}

function deploy_console() {
  local operatorURL=$1
  local consoleDeployDir=$TMP_INTEG_DIR/consoleDeploy
  mkdir $consoleDeployDir

  local consoleEditedManifest="$consoleDeployDir/console-edited-manifest.yaml"
  cp $CONSOLE_MANIFEST $consoleEditedManifest || return 1

  local deployIdx=$(find_index_of_deployment $consoleEditedManifest) || return 1
  local apiUrlIdx=$(find_deployment_container_env ${consoleEditedManifest} $deployIdx 0 "VZ_API_URL")
  if [ -z "$apiUrlIdx" ]; then
    add_deployment_container_env ${consoleEditedManifest} $deployIdx 0 "VZ_API_URL" "$operatorURL" || return 1
  else
    consoleerr "Replacing VZ_API_URL in console manifest $consoleEditedManifest"
    yq w -i -d $deployIdx $consoleEditedManifest \
      "spec.template.spec.containers[0].env[$apiUrlIdx].value" "$operatorURL" || return 1
  fi

  yq w -i -d $deployIdx $consoleEditedManifest "spec.template.spec.containers[0].image" "${CONSOLE_DOCKER_IMAGE}" || return 1

  # check if docker image is locally present - otherwise, pull it
  # this check is needed since docker pull will fail for locally built images
  # that are not pushed to any repository
  if ! docker inspect $CONSOLE_DOCKER_IMAGE > /dev/null ; then
    consoleerr "Pulling docker image for console"
    docker pull $CONSOLE_DOCKER_IMAGE || return 1
  fi

  consoleerr "Loading docker image $CONSOLE_DOCKER_IMAGE into KinD cluster ${CLUSTER_NAME}"
  kind load docker-image --name ${CLUSTER_NAME} ${CONSOLE_DOCKER_IMAGE} || return 1

  consoleerr "Deploying console from file $consoleEditedManifest"
  kubectl apply -f $consoleEditedManifest || return 1

  consoleerr
  consoleerr "Waiting for console pod to reach ready state"
  kubectl -n ${VZ_NAMESPACE} wait --for=condition=ready pods -l app=console --timeout 2m

}

# Finds the nodePort value for a named port in a K8S manifest file
# Assumes there is only one service in the YAML
function find_node_port_with_name() {
  local yamlFile=$1
  local portName=$2
  local svcIdx=$(find_index_of_service "$yamlFile")
  if [ -z "$svcIdx" ]; then
    return 1
  fi
  yq r -d $svcIdx "$yamlFile" "spec.ports(name==$portName).nodePort"
}

# Deploy CRDs
deploy_crds || exit 1

echo
echo "Creating namespace $VZ_NAMESPACE"
kubectl create namespace $VZ_NAMESPACE

echo
echo "Determining console node port URL"
consoleNodePort=$(find_node_port_with_name "$CONSOLE_MANIFEST" "ui") || exit 1
operatorNodePort=$(find_node_port_with_name "$VZ_OPERATOR_NODEPORT_YAML" "api") || exit 1
workerIP="$(kubectl get node ${CLUSTER_NAME}-worker -o json | jq -r '.status.addresses[] | select (.type=="InternalIP") | .address')"
consoleNodePortURL="http://${workerIP}:${consoleNodePort}"
echo "Console node port url is ${consoleNodePortURL}"
deploy_verrazzano_operator "$consoleNodePortURL"
operatorNodePortURL="http://${workerIP}:${operatorNodePort}"
deploy_console $operatorNodePortURL
