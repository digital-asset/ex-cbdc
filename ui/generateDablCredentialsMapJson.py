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


def get_credentials(party):
    return party["partyName"], {
        "partyId": party["party"],
        "host": ledger_api_url,
        "token": party["token"],
        "ledgerId": party["ledgerId"]
    }


with open("parties.json") as parties_json:
    parties = json.load(parties_json)
    credentials = dict(get_credentials(party) for party in parties)
    print(json.dumps(credentials))
