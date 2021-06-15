#! /usr/bin/env bash
#
# Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#

set -euo pipefail

function getDependencyLinesWithProperErrorHandling() {
  if ! grep -E '^  - .*/.daml/dist/.*dar$' "$1"
  then
    # grep returns 1 if no lines were selected, 2 on error :-(
    if [ $? = 2 ]
    then
      return 1
    else
      return 0
    fi
  fi
}

project_dir="$1"
# yq would be more reliable, but 5-10x slower
# TODO (see also https://digitalasset.atlassian.net/browse/ERA-940) support arbitrary project structure
getDependencyLinesWithProperErrorHandling "$project_dir"/daml.yaml | sed "s|^  - ../||"

# TODO - this should be using the source field from daml.yaml
echo "$project_dir"/daml.yaml
find "$project_dir" -name '*.daml' -not -path '*/.daml*'
