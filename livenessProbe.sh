#!/bin/bash
#
# Copyright (C) 2020, Oracle and/or its affiliates.
#
# check that the node process is running
TEST=`ps | grep node | wc -l | awk ' { print $1; } '`

# if it is not, then send liveness failre (i.e. non-zero exit code)
if [ "$TEST" != "0" ]; then
    exit 0
else
    exit 1
fi
