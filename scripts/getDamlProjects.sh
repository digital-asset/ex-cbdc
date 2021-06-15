#! /usr/bin/env bash
#
# Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#

set -euo pipefail

function yamlPathToDarPath() {
  echo $i | sed -e 's|\(.*\)/daml.yaml|\1/.daml/dist/\1-1.0.0.dar|g'
}

function assertFlatProjectStructure() {
  deepYamls=$(find . -mindepth 3 -name 'daml.yaml')
  if [ ! -z "$deepYamls" ]
  then
    echo "ERROR: found $deepYamls"
    echo 'Expected flat project structure: all daml.yaml should be found with e.g. `ls */daml.yaml`'
    exit 1
  fi
}

assertFlatProjectStructure

for i in */daml.yaml
do
  yamlPathToDarPath $i
done \
  | sort
