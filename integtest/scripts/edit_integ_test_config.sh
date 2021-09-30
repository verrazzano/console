#!/bin/bash
#
# Copyright (c) 2020, 2021, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
#
# Edit a given input test configuration file

INPUT_CONFIG_FILE=$1

CONSOLE_HOST="$(kubectl get ingress verrazzano-ingress -n verrazzano-system -o jsonpath='{.spec.rules[0].host}')"
GRAFANA_HOST="$(kubectl get ingress vmi-system-grafana -n verrazzano-system -o jsonpath='{.spec.rules[0].host}')"
KIBANA_HOST="$(kubectl get ingress vvmi-system-kibana -n verrazzano-system -o jsonpath='{.spec.rules[0].host}')"
PROMETHEUS_HOST="$(kubectl get ingress vmi-system-prometheus -n verrazzano-system -o jsonpath='{.spec.rules[0].host}')"
CONSOLE_URL="https://${CONSOLE_HOST}"
GRAFANA_URL="https://${GRAFANA_HOST}"
KIBANA_URL="https://${KIBANA_HOST}"
PROMETHEUS_URL="https://${PROMETHEUS_HOST}"
CONSOLE_PWD="$(kubectl get secret --namespace verrazzano-system verrazzano -o jsonpath={.data.password} | base64 --decode)"

cat "${INPUT_CONFIG_FILE}" | jq  --arg console_url "${CONSOLE_URL}" --arg grafana_url "${GRAFANA_URL}" --arg kibana_url "${KIBANA_URL}" --arg prometheus_url "${PROMETHEUS_URL}" --arg user "verrazzano" --arg pwd "${CONSOLE_PWD}" '.driverInfo.url = $console_url | .grafana.url = $grafana_url | .kibana.url = $kibana_url | .prometheus.url = $prometheus_url | .loginInfo.username = $user | .loginInfo.password = $pwd'
