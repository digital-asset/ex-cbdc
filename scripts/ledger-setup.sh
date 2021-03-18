#!/usr/bin/env bash
#
# Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#

set -u -e

PARTICIPANT_CONFIG=${1:?Specify the participants.json.}
PARTY_FILE=${2:?Specify the parties.json file.}

function run_script() {
  daml script \
    --dar ./testing/.daml/dist/testing-1.0.0.dar \
    --participant-config "${PARTICIPANT_CONFIG}" \
    --input-file "${PARTY_FILE}" \
    --script-name "Testing.Init.Init:initDemo" \
    "$@"
}

run_script "${@:3}"
