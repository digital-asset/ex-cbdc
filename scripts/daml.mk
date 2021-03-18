#
# Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#

DAR_FILE=.daml/dist/$(PROJECT)-1.0.0.dar
DAML_SRC=$(shell find daml/ -name '*.daml')
DEPS=$(shell ../scripts/getDeps.sh daml.yaml)

build: $(DAR_FILE)

test: build
	daml test --junit ../target/daml-test-reports/$(PROJECT).xml

$(DAR_FILE): $(DAML_SRC) $(DEPS) daml.yaml
	daml build --output $@

clean:
	daml clean
