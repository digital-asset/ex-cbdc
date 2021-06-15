#
# Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#

comma := ,
daml ?= daml
dars := $(shell scripts/getDamlProjects.sh)
project-root = $(patsubst %/.daml/dist,%,$(@D))
phony-test-targets := $(patsubst %,%-phony-test-target,$(dars))

ifneq ($(.SHELLSTATUS),0)
  $(error shell command failed (code $(.SHELLSTATUS)), please double check the prerequisites, test manually scripts/getDaml*.sh, etc. Sorry, debugging this error is quite technical, please reach out to maintainers.)
endif

.PHONY: build-dars
build-dars: $(dars)

.PHONY: test-dars
test-dars: $(phony-test-targets)

ui/daml.js: $(dars)
	$(daml) codegen js $^ -o $@
	@touch $@

.PHONY: $(phony-test-targets)
$(phony-test-targets): build-dars
	@# TODO remove $(PWD)/ when resolved: https://github.com/digital-asset/daml/issues/9646
	DAML_PROJECT=$(project-root) $(daml) test --junit $(PWD)/target/daml-test-reports/$(@F).xml

.SECONDEXPANSION:
$(dars): $$(shell scripts/getDamlDependencies.sh $$(project-root))
	$(daml) build --project-root $(project-root)
