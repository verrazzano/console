# Copyright (C) 2020, 2023, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

FROM ghcr.io/oracle/oraclelinux:8-slim AS builder

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

WORKDIR /verrazzano/

RUN npm install --production --save express express-http-proxy \
    && npm cache clean --force \
    && rm -rf /usr/bin/npm /usr/lib/node_modules/npm

FROM ghcr.io/verrazzano/ol8-base:v0.0.1-20231102152128-e7afc807

COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group

COPY --from=builder /usr/bin/node /usr/bin/
COPY --from=builder /usr/lib64/libbrot* /usr/lib64/
COPY --from=builder /usr/lib64/libstdc++* /usr/lib64/

COPY --from=builder /verrazzano/node_modules/ /verrazzano/node_modules/

COPY LICENSE.txt README.md THIRD_PARTY_LICENSES.txt SECURITY.md /licenses/

COPY web /verrazzano/web
COPY start.sh /verrazzano/
COPY server.js /verrazzano/
COPY generate-env.js /verrazzano/
COPY package.json /verrazzano/

USER 1000
WORKDIR /verrazzano/
CMD ["./start.sh"]
