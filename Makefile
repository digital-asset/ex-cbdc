#
# Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#

build: build-dars build-ui

test: test-dars test-ui check-license

clean:
	rm -rf */.daml/
	rm -rf target/
	rm -rf ui/daml.js
	$(MAKE) clean -C ui

check-license:
	mvn license:check

build-ui: ui/daml.js
	$(MAKE) -C ui

test-ui: build-ui
	$(MAKE) -C ui test

daml-hub-package: build
	$(MAKE) -C ui daml-hub-package LEDGER_ID=$(LEDGER_ID)

include daml.mk
