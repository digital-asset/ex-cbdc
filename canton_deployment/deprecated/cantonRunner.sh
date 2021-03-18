#!/usr/bin/env bash
#
# Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#


PARTY_FILE="parties.txt"
CANTON_PARTY_MAP="canton_party_map.txt"
CANTON_PARTCIPANT_MAP="canton_participants.cfg"

function run_trigger () {
    daml script \
    --dar ./testing/.daml/dist/testing-1.0.0.dar \
    --participant-config "${CANTON_PARTCIPANT_MAP}" \
    --input-file "${PARTY_FILE}" \
    --script-name "${1}" &> canton_scripts.log
    return $?
}

echo "Initial creation of the first ContinueInitEvent."
run_trigger "Testing.Init.Init:addContinueEvent"
if [ $? -ne 0 ]
  then
    echo "Error."
    exit 1
fi

while : ; do
    # Wait for ContinueInitEvent and exercise Continue if possible.
    # It may happen that the contract is not yet available.
    while ! run_trigger "Testing.Init.Init:tryToContinueInitEvent" ; do
        echo "Not ready for another market setup yet..."
    done

    echo "Setting up market."
    run_trigger "Testing.Init.Init:initDemo"
    if [ $? -ne 0 ]
    then
        echo "Error."
        exit 1
    fi
done
