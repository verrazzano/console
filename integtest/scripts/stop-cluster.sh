#!/bin/bash
#
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
#

ROOT_DIR="$(cd $(dirname "${BASH_SOURCE}")/.. && pwd -P)"
. "${ROOT_DIR}/scripts/common.sh"

create_tmp_dir
download_kind

${KIND_BIN} delete cluster --name=${CLUSTER_NAME}
rm -rf ${TMP_DIR}
