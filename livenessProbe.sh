#!/bin/bash
#
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
#
TEST=`ps | grep node | wc -l | awk ' { print $1; } '`

# if NodeJS process is not alive, then send liveness failure (i.e. non-zero exit code)
if [ "$TEST" != "0" ]; then
    exit 0
else
    exit 1
fi
