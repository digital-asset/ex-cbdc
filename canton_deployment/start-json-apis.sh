#!/usr/bin/env bash
#
# Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#

set -e

# shellcheck disable=SC2086
function cleanup() {
  local processes
  processes=$(jobs -p)
  echo Killing $processes
  kill $processes
}

trap "cleanup" INT QUIT TERM

# shellcheck disable=SC2086
function wait_for_processes() {
  local processes
  processes=$(jobs -p)
  echo Waiting $processes
  wait $processes
}

function run_json_api() {
  daml json-api --ledger-host "$1" --ledger-port "$2" --http-port "$3" &
}

run_json_api "localhost" "5011" "5013"

run_json_api "localhost" "5021" "5023"

run_json_api "localhost" "5031" "5033"

run_json_api "localhost" "5041" "5043"

run_json_api "localhost" "5051" "5053"

run_json_api "localhost" "5061" "5063"

wait_for_processes
