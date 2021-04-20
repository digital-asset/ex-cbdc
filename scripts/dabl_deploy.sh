#!/usr/bin/env bash
#
# Copyright (c) 2019, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#

set -ex

# Daml Script returns an error if called "too early".
# Possibly, the API is not up yet (despite that dablc health reports OK).
function sleep_to_avoid_script_error() {
  sleep 120
}

STAMP=$(date "+%H%M%S")
PROJECT_NAME=Cbdc$STAMP

LEDGER_NAME=cbdc

PROJECT_ID=$(dablc -j project ensure "$PROJECT_NAME" | jq -r '.project_id')
LEDGER_ID=$(dablc -j ledger create "$PROJECT_ID" $LEDGER_NAME | jq -r '.ledger_id')

echo "Deploying $PROJECT_ID / $LEDGER_ID"

for name in Alice BankA BankB DemoAdmin ECB Landlord LandlordsAssociation USFRB
do
  dablc -j ledger party "$LEDGER_ID" $name > /dev/null
done

dablc -j ledger pps "$LEDGER_ID" > ui/participants.json

LEDGER_ID=$LEDGER_ID make daml-hub-package

mkdir -p deploy
cp reset/.daml/dist/reset-1.0.0.dar \
   triggers/.daml/dist/triggers-1.0.0.dar \
   ./ui/cbdc-ui.zip \
   deploy

for file in deploy/*
do
  dablc -j workspace upload deploy/"$file"
done

DAR_SHA=$(dablc -j workspace install reset-1.0.0.dar "$LEDGER_ID" | jq -r '.artifact_hash')
UI_SHA=$(dablc -j workspace install cbdc-ui.zip "$LEDGER_ID"| jq -r '.artifact_hash')
TRIGGER_HASH=$(dablc -j workspace install triggers-1.0.0.dar "$LEDGER_ID" | jq -r '.artifact_hash')

dablc -j ledger dar "$LEDGER_ID" "$DAR_SHA"

dablc -j ledger ui "$LEDGER_ID" "$UI_SHA"

sleep_to_avoid_script_error

scripts/ledger-setup.sh ui/participants.json ui/dabl-parties.json --json-api

USER_TEMP_FILENAME=$(mktemp dabl_deploy.XXX)
dablc -j ledger users "$LEDGER_ID" > "$USER_TEMP_FILENAME"

BANK_A_USER_ID=$(jq -r '.parties | .[] |  select( .partyName == "BankA") | .party' "$USER_TEMP_FILENAME")

rm "$USER_TEMP_FILENAME"

dablc -j ledger trigger "$LEDGER_ID" "$TRIGGER_HASH" "Testing.Triggers.AutoSettle:autoSettleTrigger" \
    "$BANK_A_USER_ID" "BankA accepts product transfers."
