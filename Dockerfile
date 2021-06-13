# Copyright (C) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

FROM ghcr.io/oracle/oraclelinux:7-slim

RUN yum install -y krb5-libs \
    && yum update -y python curl openssl-libs glibc openldap nss nss-sysinit nss-tools glib2 \
    && yum install -y oracle-nodejs-release-el7 \
    && yum install -y nodejs \
    && yum install -y krb5-libs-1.15.1-50.0.1.el7.x86_64.rpm \
    && mkdir /verrazzano \
    && mkdir /license \
    && yum clean all \
    && rm -rf /var/cache/yum
COPY LICENSE.txt /license/
COPY THIRD_PARTY_LICENSES.txt /license/
COPY web /verrazzano/web
COPY livenessProbe.sh /verrazzano/
COPY start.sh /verrazzano/
COPY server.js /verrazzano/
COPY package.json /verrazzano/
RUN cd /verrazzano/
RUN npm install --save express express-http-proxy 
HEALTHCHECK --interval=1m --timeout=10s \
  CMD /verrazzano/livenessProbe.sh

RUN groupadd -r verrazzano \
    && useradd --no-log-init -r -g verrazzano -u 1000 verrazzano \
    && chown -R 1000:verrazzano /verrazzano \
    && chown -R 1000:verrazzano /license

USER 1000
WORKDIR /verrazzano/
CMD ["./start.sh"]
