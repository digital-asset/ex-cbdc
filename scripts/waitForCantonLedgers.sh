#!/usr/bin/env bash
#
# Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#

basedir=$(dirname "$0")

for i in $(seq 1 6); do
  ledger_port="50$i"1
  "$basedir/waitForLedger.sh" "localhost" "$ledger_port"
done
