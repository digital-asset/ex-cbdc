#!/usr/bin/env bash
#
# Copyright (c) 2019, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#


# Terminate on any failure
set -ex

STAMP=$(date "+%H%M%S")
PROJECT_NAME=Cbdc$STAMP

LEDGER_NAME=cbdc
# The 'jq -r' removes the superfluous quotes for our variables.

PROJECT_ID=`dablc -j project ensure ${PROJECT_NAME} | jq -r '.project_id'`
LEDGER_ID=`dablc -j ledger create ${PROJECT_ID} ${LEDGER_NAME} | jq -r '.ledger_id'`

echo $LEDGER_ID

# Create Users on ledger.
for name in Alice BankA BankB DemoAdmin ECB Landlord LandlordsAssociation USFRB
do
  dablc -j ledger party ${LEDGER_ID} $name > /dev/null
done

# Get a participants.json
dablc -j ledger pps ${LEDGER_ID} > ui/participants.json

# Rebuild the UI so that it contains the right JWTs to login.
LEDGER_ID=${LEDGER_ID} make daml-hub-package

mkdir -p deploy
cp reset/.daml/dist/reset-1.0.0.dar \
   triggers/.daml/dist/triggers-1.0.0.dar \
   ./ui/cbdc-ui.zip \
   deploy

# Upload files to workspaces
for file in `ls deploy/`
do
  dablc -j workspace upload deploy/$file
done

# From workspace to ledger
DAR_SHA=`dablc -j workspace install reset-1.0.0.dar ${LEDGER_ID} | jq -r '.artifact_hash'`
UI_SHA=`dablc -j workspace install cbdc-ui.zip ${LEDGER_ID}| jq -r '.artifact_hash'`
TRIGGER_HASH=`dablc -j workspace install triggers-1.0.0.dar ${LEDGER_ID} | jq -r '.artifact_hash'`

# Dar deploy.
dablc -j ledger dar ${LEDGER_ID} ${DAR_SHA}

# UI deploy.
dablc -j ledger ui ${LEDGER_ID} ${UI_SHA}

# mac os specific
sleep 120

# Initialize the ledger contract data.
scripts/ledger-setup.sh ui/participants.json ui/dabl-parties.json --json-api

# Grab users
USER_TEMP_FILENAME=`mktemp dabl_deploy.XXX`
dablc -j ledger users ${LEDGER_ID} > ${USER_TEMP_FILENAME}

## Alice BankA BankB DemoAdmin ECB Landlord LandlordsAssociation USFRB
BANKA_USER_ID=`jq -r '.parties | .[] |  select( .partyName == "BankA") | .party' ${USER_TEMP_FILENAME}`

rm ${USER_TEMP_FILENAME}

# Deploy triggers to ledger
dablc -j ledger trigger ${LEDGER_ID} ${TRIGGER_HASH} "Testing.Triggers.AutoSettle:autoSettleTrigger" \
    ${BANKA_USER_ID} "BankA accepts product transfers."
