# Copyright (C) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

FROM container-registry.oracle.com/os/oraclelinux:7-slim@sha256:9b86d1332a883ee8f68dd44ba42133de518b2e0ec1cc70257e59fb4da86b1ad3
RUN yum update -y \
    && yum install -y oracle-nodejs-release-el7 \
    && yum install -y nodejs
    && mkdir /verrazzano
    && mkdir /license
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

WORKDIR /verrazzano/
CMD ["./start.sh"]