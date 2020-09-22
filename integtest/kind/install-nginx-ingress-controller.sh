#!/usr/bin/env bash

NGINX_INGRESS_CONTROLLER_IMAGE=container-registry.oracle.com/verrazzano/nginx-ingress-controller
NGINX_INGRESS_CONTROLLER_TAG=0.32-aadecdc-21
NGINX_DEFAULT_BACKEND_IMAGE=container-registry.oracle.com/verrazzano/nginx-ingress-default-backend
NGINX_DEFAULT_BACKEND_TAG=0.32-aadecdc-21
NGINX_INGRESS_CONTROLLER_VERSION=1.27.0
INGRESS_TYPE=NodePort

helm repo add stable https://kubernetes-charts.storage.googleapis.com
helm repo update
helm upgrade ingress-controller stable/nginx-ingress --install \
  --set controller.image.repository=$NGINX_INGRESS_CONTROLLER_IMAGE \
  --set controller.image.tag=$NGINX_INGRESS_CONTROLLER_TAG \
  --set controller.config.client-body-buffer-size=64k \
  --set defaultBackend.image.repository=$NGINX_DEFAULT_BACKEND_IMAGE \
  --set defaultBackend.image.tag=$NGINX_DEFAULT_BACKEND_TAG \
  --namespace ingress-nginx \
  --set controller.metrics.enabled=true \
  --set controller.podAnnotations.'prometheus\.io/port'=10254 \
  --set controller.podAnnotations.'prometheus\.io/scrape'=true \
  --set controller.podAnnotations.'system\.io/scrape'=true \
  --version $NGINX_INGRESS_CONTROLLER_VERSION \
  --set controller.service.type="${INGRESS_TYPE}" \
  --set controller.publishService.enabled=true \
  --timeout 15m0s \
  --wait
