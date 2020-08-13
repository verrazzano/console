# Copyright (C) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

FROM container-registry.oracle.com/os/oraclelinux:7-slim@sha256:9b86d1332a883ee8f68dd44ba42133de518b2e0ec1cc70257e59fb4da86b1ad3
RUN yum install -y oracle-nodejs-release-el7
RUN yum install -y nodejs
RUN mkdir /verrazzano
COPY web /verrazzano/web
COPY livenessProbe.sh /verrazzano/
COPY start.sh /verrazzano/
COPY server.js /verrazzano/
RUN cd /verrazzano/
RUN npm init -y
RUN npm install --save express@4.17.1
HEALTHCHECK --interval=1m --timeout=10s \
  CMD /verrazzano/livenessProbe.sh

WORKDIR /verrazzano/
CMD ["./start.sh"]