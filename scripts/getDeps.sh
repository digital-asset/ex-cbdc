#!/usr/bin/env bash
#
# Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#

daml_yaml="$1"

function getDependencyLines() {
  grep -E '^  - \.\./.*/.daml/dist/.*dar$'
}

function dependencyLineToDarFile() {
  sed 's/^  - //'
}

< "$daml_yaml" getDependencyLines | dependencyLineToDarFile
