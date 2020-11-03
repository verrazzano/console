#
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
#

function consoleerr() {
  >&2 echo "$(date -u '+%Y-%m-%d %H:%M%:%S %Z')" "$@"
}

function consoledebug() {
  if [ "$LOG_LEVEL" == "DEBUG" ]; then
    >&2 echo "$(date -u '+%Y-%m-%d %H:%M%:%S %Z')" "$@"
  fi
}

function find_index_of_item_in_array() {
  if [ $# -lt 2 ]; then
    consoleerr "find_index_of_item_in_array requires at least 2 arguments <value to match> <array items...>, but got arguments" "$@"
    return 1
  fi

  local valueToFind=$1
  shift
  local givenArray=($@)
  consoledebug "looking for item $valueToFind in array " "${givenArray[@]}"
  for i in "${!givenArray[@]}" ; do
    consoledebug "array index $i with value ${givenArray[$i]}"
    if [ "${givenArray[$i]}" == "$valueToFind" ]; then
      # echo the index of the value - this is our output and we are done
      consoledebug "Found exact match at index $i"
      echo $i
      return 0
    elif [ "$(echo ${givenArray[$i]} | grep -- $valueToFind)" != "" ]; then
      consoledebug "Found approximate match at index $i"
      echo $i
      return 0
    fi
  done
  # value not found
  consoledebug "Did not find $valueToFind"
  return 1
}

function find_index_in_multi_doc_yaml() {
  multiYamlFile=$1
  filter=$2
  itemToFindIndexOf=$3
  consoleerr "Looking for $filter = $itemToFindIndexOf in file $multiYamlFile"
  local foundArray=($(yq r -d'*' $multiYamlFile "$filter"))
  consoledebug "Found items with "$filter" in multi doc yaml: ${foundArray[@]}"
  local itemIdx=$(find_index_of_item_in_array "$itemToFindIndexOf" "${foundArray[@]}")
  if [ $? -ne 0 ]; then
    consoleerr "$itemToFindIndexOf not found in file $multiYamlFile"
    return 1
  fi
  echo $itemIdx
  return 0
}

function add_deployment_container_arg() {
  local yamlFile=$1
  local docIdx=$2 # Document index within the file, of the deployment to edit
  local containerIdx=$3 # Index of the container within the deployment
  local argValue=$4 # value of the arg to add

  yq w -i -d $docIdx $yamlFile -- "spec.template.spec.containers[$containerIdx].args[+]" $argValue
  if [ $? -ne 0 ]; then
    consoleerr "Could not edit Deployment to add argument $argValue at index $docIdx in $yamlFile"
    return 1
  fi
  return 0
}

function find_deployment_container_env() {
  local yamlFile=$1
  local docIdx=$2 # Document index within the file, of the deployment to edit
  local containerIdx=$3 # Index of the container within the deployment
  local envName=$4 # name of the env variable to add

  # Retrieve names of all env vars for the verrazzano operator container and store in an array
  local envArray=($(yq r -d $docIdx $yamlFile "spec.template.spec.containers[$containerIdx].env[*].name"))

  # Find the index of the env var named ACCESS_CONTROL_ALLOW_ORIGIN so that we can set it to console URL
  local envIdx=$(find_index_of_item_in_array "$envName" "${envArray[@]}")
  echo $envIdx
}

function add_deployment_container_env() {
  local yamlFile=$1
  local docIdx=$2 # Document index within the file, of the deployment to edit
  local containerIdx=$3 # Index of the container within the deployment
  local envName=$4 # name of the env variable to add
  local envValue=$5 # value of the env variable to add

  local envArrayLen="$(yq r --length -d $docIdx $yamlFile "spec.template.spec.containers[$containerIdx].env")"
  consoledebug "Adding env var $envName at index $envArrayLen"
  yq w -i -d $docIdx $yamlFile -- "spec.template.spec.containers[0].env[$envArrayLen].name" "$envName"
  yq w -i -d $docIdx $yamlFile -- "spec.template.spec.containers[0].env[$envArrayLen].value" "$envValue"
}
