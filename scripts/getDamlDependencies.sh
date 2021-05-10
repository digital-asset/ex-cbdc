#! /usr/bin/env bash
#
# Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#

set -euo pipefail

project_dir="$1"
# yq would be more reliable, but 5-10x slower
deps=$(grep -E '^  - .*/.daml/dist/.*dar$' "$project_dir"/daml.yaml | sed "s|^  - |$project_dir/|")
[ -n "${deps}" ] && realpath -m --relative-to="${PWD}" ${deps}

# TODO - this should be using the source field from daml.yaml
echo "$project_dir"/daml.yaml
find "$project_dir" -name '*.daml' -not -path '*/.daml*'
