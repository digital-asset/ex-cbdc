#!/usr/bin/env bash
#
# Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#

# TODO optionally use fswatch to further reduce CPU load
# which is already negligable on an average developer box

while true
do
  sleep 1
  make -j
done
