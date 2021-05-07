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
	$(RM) $(DAR_DEPENDENCY_GRAPH)

check-license:
	mvn license:check

update-license:
	mvn license:format

# e.g. banking certificates ...
# supposing a flat directory structure for simplicity
DAML_DIRS=$(shell echo */daml.yaml | sed 's|/daml.yaml||g')

# e.g. banking-damldir certificates-damldir ...
PHONY_DAR_BUILD_TARGETS=$(DAML_DIRS:=-damldir)

# e.g. banking-damltest certificates-damltest ...
PHONY_DAR_TEST_TARGETS=$(DAML_DIRS:=-damltest)

build-dars: $(PHONY_DAR_BUILD_TARGETS)

# re-builds and re-reads the dependency graph as needed
# (see https://www.gnu.org/software/make/manual/html_node/Remaking-Makefiles.html)
DAR_DEPENDENCY_GRAPH=dependencies.mk
include $(DAR_DEPENDENCY_GRAPH)
$(DAR_DEPENDENCY_GRAPH): $(shell find -name daml.yaml)
	scripts/makeDeps.sh $(DAML_DIRS) > $@

%-damldir:
	$(MAKE) -C $*

build-ui: build-dars
	$(MAKE) -C ui

test-ui: build-ui
	$(MAKE) -C ui test

test-dars: build-dars
test-dars: $(PHONY_DAR_TEST_TARGETS)

%-damltest: %-damldir
	$(MAKE) -C $* test

daml-hub-package: build
	$(MAKE) -C ui daml-hub-package LEDGER_ID=$(LEDGER_ID)
