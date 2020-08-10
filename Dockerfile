FROM container-registry.oracle.com/os/oraclelinux:7-slim@sha256:9b86d1332a883ee8f68dd44ba42133de518b2e0ec1cc70257e59fb4da86b1ad3
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY
ENV http_proxy $HTTP_PROXY
ENV https_proxy $HTTPS_PROXY
ENV no_proxy $NO_PROXY
RUN yum install -y oracle-nodejs-release-el7
RUN yum install -y nodejs
ENV http_proxy ""
ENV https_proxy ""
ENV no_proxy ""
RUN mkdir /verrazzano
COPY web /verrazzano/web
COPY livenessProbe.sh /verrazzano/
COPY start.sh /verrazzano/
COPY server.js /verrazzano/
RUN npm config set registry https://artifacthub-tip.oraclecorp.com/api/npm/npmjs-remote
RUN npm config set strict-ssl false
RUN cd /verrazzano/
RUN npm init -y
RUN npm install --save express cors
HEALTHCHECK --interval=1m --timeout=10s \
  CMD /verrazzano/livenessProbe.sh

WORKDIR /verrazzano/
CMD ["./start.sh"]