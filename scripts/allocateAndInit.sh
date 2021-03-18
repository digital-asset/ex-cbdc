#!/usr/bin/env bash
#
# Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#

set -e

PARTY_FILE="parties.json"
PARTICIPANT_CONFIG=${1:-default_participant_config.cfg}

function run_script() {
  daml script \
    --dar ./testing/.daml/dist/testing-1.0.0.dar \
    --participant-config "${PARTICIPANT_CONFIG}" \
    --script-name "${1}" \
    "${@:2}"
}

echo "Market setup script: ${0} $PARTICIPANT_CONFIG"

echo "Initial party allocation."
run_script "Testing.Common.Parties:setupParties" --output-file $PARTY_FILE

echo "Setting up market."
run_script "Testing.Init.Init:initDemo" --input-file $PARTY_FILE
