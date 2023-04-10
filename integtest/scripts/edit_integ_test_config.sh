#!/bin/bash
#
# Copyright (c) 2020, 2022, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
#
# Edit a given input test configuration file

INPUT_CONFIG_FILE=$1

CONSOLE_HOST="$(kubectl get ingress verrazzano-ingress -n verrazzano-system -o jsonpath='{.spec.rules[0].host}' || echo)"
GRAFANA_HOST="$(kubectl get ingress vmi-system-grafana -n verrazzano-system -o jsonpath='{.spec.rules[0].host}' || echo)"
OSD_HOST="$(kubectl get ingress vmi-system-osd -n verrazzano-system -o jsonpath='{.spec.rules[0].host}' || echo)"
PROMETHEUS_HOST="$(kubectl get ingress vmi-system-prometheus -n verrazzano-system -o jsonpath='{.spec.rules[0].host}' || echo)"
KIALI_HOST="$(kubectl get ingress vmi-system-kiali -n verrazzano-system -o jsonpath='{.spec.rules[0].host}' || echo)"
JAEGER_HOST="$(kubectl get ingress verrazzano-jaeger -n verrazzano-system -o jsonpath='{.spec.rules[0].host}' || echo)"
THANOS_QUERY_HOST="$(kubectl get ingress thanos-query-frontend -n verrazzano-system -o jsonpath='{.spec.rules[0].host}' || echo)"

if [ ! -z "$CONSOLE_HOST" ]; then
  CONSOLE_URL="https://${CONSOLE_HOST}"
fi
if [ ! -z "$GRAFANA_HOST" ]; then
  GRAFANA_URL="https://${GRAFANA_HOST}"
fi
if [ ! -z "$OSD_HOST" ]; then
  OSD_URL="https://${OSD_HOST}"
fi
if [ ! -z "$PROMETHEUS_HOST" ]; then
  PROMETHEUS_URL="https://${PROMETHEUS_HOST}"
fi
if [ ! -z "$KIALI_HOST" ]; then
  KIALI_URL="https://${KIALI_HOST}"
fi
if [ ! -z "$JAEGER_HOST" ]; then
  JAEGER_URL="https://${JAEGER_HOST}"
fi
if [ ! -z "$THANOS_QUERY_HOST" ]; then
  THANOS_QUERY_URL="https://${THANOS_QUERY_HOST}"
fi
CONSOLE_PWD="$(kubectl get secret --namespace verrazzano-system verrazzano -o jsonpath={.data.password} | base64 --decode)"
cat "${INPUT_CONFIG_FILE}" | jq  --arg console_url "${CONSOLE_URL}" --arg grafana_url "${GRAFANA_URL}" \
  --arg osd_url "${OSD_URL}" --arg prometheus_url "${PROMETHEUS_URL}" --arg kiali_url "${KIALI_URL}" \
  --arg thanos_query_url "${THANOS_QUERY_URL}" \
  --arg jaeger_url "${JAEGER_URL}" \
  --arg user "verrazzano" --arg pwd "${CONSOLE_PWD}" \
  --arg app "${CONSOLE_APP_NAME}" --arg ns "${CONSOLE_APP_NAMESPACE}" \
  --arg cluster "${CONSOLE_APP_CLUSTER}" --arg comp "${CONSOLE_APP_COMP}" \
  '.driverInfo.url = $console_url | .grafana.url = $grafana_url | .osd.url = $osd_url | .prometheus.url = $prometheus_url | .kiali.url = $kiali_url | .jaeger.url = $jaeger_url | .thanos-query.url = $thanos_query_url | .loginInfo.username = $user | .loginInfo.password = $pwd | .app.name=$app | .app.namespace=$ns | .app.cluster=$cluster | .app.components[0]=$comp'
