# Copyright (C) 2020, 2022, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

FROM ghcr.io/oracle/oraclelinux:7-slim

RUN yum install -y krb5-libs \
    && yum update -y python curl openssl-libs glibc openldap nss nss-sysinit nss-tools glib2 \
    && yum update -y libxml2 libxml2-python \
    && yum install -y oracle-nodejs-release-el7 \
    && yum install -y nodejs \
    && yum install -y openssl \
    && mkdir /verrazzano \
    && mkdir /licenses \
    && yum clean all \
    && rm -rf /var/cache/yum

COPY LICENSE.txt README.md THIRD_PARTY_LICENSES.txt SECURITY.md /licenses/

COPY web /verrazzano/web
COPY livenessProbe.sh /verrazzano/
COPY start.sh /verrazzano/
COPY server.js /verrazzano/
COPY generate-env.js /verrazzano/
COPY package.json /verrazzano/
WORKDIR /verrazzano/

RUN npm install --save express express-http-proxy \
    && rm -rf /usr/bin/npm /usr/lib/node_modules/npm

HEALTHCHECK --interval=1m --timeout=10s \
  CMD /verrazzano/livenessProbe.sh

RUN groupadd -r verrazzano \
    && useradd --no-log-init -r -g verrazzano -u 1000 verrazzano \
    && chown -R 1000:verrazzano /verrazzano \
    && chown -R 1000:verrazzano /licenses

USER 1000
WORKDIR /verrazzano/
CMD ["./start.sh"]
