# Copyright (C) 2020, 2022, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

FROM ghcr.io/oracle/oraclelinux:8-slim

RUN microdnf update -y \
    && microdnf module enable nodejs:16 \
    && microdnf install --nodocs -y krb5-libs nodejs openssl \
    && microdnf clean all \
    && rm -rf /var/cache/yum /var/lib/rpm/* /var/lib/dnf/* \
    && mkdir /verrazzano \
    && mkdir /licenses \
    && groupadd -r verrazzano \
    && useradd --no-log-init -r -g verrazzano -u 1000 verrazzano \
    && chown -R 1000:verrazzano /verrazzano \
    && chown -R 1000:verrazzano /licenses


COPY LICENSE.txt README.md THIRD_PARTY_LICENSES.txt SECURITY.md /licenses/

COPY web /verrazzano/web
COPY livenessProbe.sh /verrazzano/
COPY start.sh /verrazzano/
COPY server.js /verrazzano/
COPY generate-env.js /verrazzano/
COPY package.json /verrazzano/
WORKDIR /verrazzano/

RUN npm install --production --save express express-http-proxy \
    && rm -rf /usr/bin/npm /usr/lib/node_modules/npm

HEALTHCHECK --interval=1m --timeout=10s \
  CMD /verrazzano/livenessProbe.sh

USER 1000
WORKDIR /verrazzano/
CMD ["./start.sh"]
