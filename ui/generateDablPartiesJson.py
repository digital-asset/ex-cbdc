#!/usr/bin/env python3
#
# Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#


import json

dabl_name_to_config_name = {
    "landlord": "landlord",
    "alice": "renter",
    "demoAdmin": "demoAdmin",
    "uSFRB": "usFRB",
    "landlordsAssociation": "landlordsAssociation",
    "bankB": "bankB",
    "bankA": "bankA",
    "eCB": "ecb"
}

with open("participants.json") as participants_json:
    participants_config = json.load(participants_json)
    party_participants = participants_config["party_participants"]
    config_parties = {dabl_name_to_config_name[dabl_name]: party_id for
                      party_id, dabl_name
                      in party_participants.items() if
                      dabl_name in dabl_name_to_config_name}
    print(json.dumps(config_parties))
