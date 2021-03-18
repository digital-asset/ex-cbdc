#
# Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#

build: build-dars build-ui

test: test-dars test-ui check-license

clean:
	rm -rf */.daml/
	rm -rf target/
	$(MAKE) clean -C ui

check-license:
	mvn license:check

update-license:
	mvn license:format

build-dars: lib-damldir certificates-damldir finance-damldir banking-damldir demoadmin-damldir landlord-damldir testing-damldir triggers-damldir reset-damldir

include scripts/dependencies.mk

%-damldir:
	$(MAKE) -C $*

build-ui: build-dars
	$(MAKE) -C ui

test-ui: build-ui
	$(MAKE) -C ui test

test-dars: build-dars
test-dars: lib-damltest certificates-damltest finance-damltest banking-damltest demoadmin-damltest landlord-damltest testing-damltest triggers-damltest reset-damltest

lib-damltest: lib-damldir
certificates-damltest: certificates-damldir
finance-damltest: finance-damldir
banking-damltest: banking-damldir
demoadmin-damltest: demoadmin-damldir
landlord-damltest: landlord-damldir
testing-damltest: testing-damldir
triggers-damltest: triggers-damldir
reset-damltest: reset-damldir

%-damltest:
	$(MAKE) -C $* test

dabl: dabl-ui

dabl-ui: build
	$(MAKE) -C ui dabl-ui LEDGER_ID=$(LEDGER_ID)
