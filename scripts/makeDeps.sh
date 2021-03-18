#!/usr/bin/env bash
#
# Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#

# Usage:  scripts/makeDeps.sh > scripts/dependencies.mk

function darFileToMakeTarget() {
  sed "s|\.\./.*/.daml/dist/\(.*\)-1.0.0.dar|\1-damldir|"
}

echo "# This file was generated with: $0 $*"
for i in lib certificates finance banking demoadmin landlord testing triggers reset
do
  echo -n "$i-damldir: "
  # Echoing a variable is needed, otherwise the output is wrong on macOS (missing the newline for empty dependencies).
  dependencies=$(scripts/getDeps.sh "$i/daml.yaml" | darFileToMakeTarget | xargs)
  echo "$dependencies"
done
