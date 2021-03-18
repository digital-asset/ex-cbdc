#!/usr/bin/env bash
#
# Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#

js_codegen_dir=${1:-ui/daml.js}

grep -R templateId: "$js_codegen_dir"  \
  | grep --invert-match "DA.Reset."  \
  | perl -n -e "/templateId:.*'(.*):(.*):(.*)'/" -e ' && printf "%s\n", $3' \
  | sort
