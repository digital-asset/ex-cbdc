#!/usr/bin/env python3
#
# Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#


import json
import sys

if len(sys.argv) < 2:
    print("Specify the ledger ID as the first argument.", file=sys.stderr)
    exit(1)

ledger_id = sys.argv[1]
ledger_api_url = "https://api.projectdabl.com/data/{}".format(ledger_id)


def invert(dictionary):
    return {v: k for k, v in dictionary.items()}


def capitalizeFirst(string):
    return string[0].upper() + string[1:]


def get_credentials(party, parties, partyIds):
    return capitalizeFirst(party), {
        "partyId": partyIds[party],
        "host": parties[party]["host"],
        "token": parties[party]["access_token"],
        "ledgerId": ledger_id
    }


with open("participants.json") as participants_json:
    participants = json.load(participants_json)
    parties = participants["participants"]
    partyIds = invert(participants["party_participants"])
    credentials = dict(get_credentials(party, parties, partyIds) for party in parties)
    print(json.dumps(credentials))
