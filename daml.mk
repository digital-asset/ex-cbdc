#
# Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#

comma := ,
daml ?= daml
rdars := $(shell scripts/getDamlProjects.sh)
dars := $(patsubst %$(comma)js,%,$(patsubst %$(comma),%,$(rdars)))
jsdars := $(patsubst %$(comma)js,%,$(filter %$(comma)js,$(rdars)))
project-root = $(patsubst %/.daml/dist,%,$(@D))
phony-test-targets := $(patsubst %,%-phony-test-target,$(dars))

ifneq ($(.SHELLSTATUS),0)
  $(error shell command failed)
endif

.PHONY: build-dars
build-dars: $(dars)

.PHONY: test-dars
test-dars: $(phony-test-targets)

ui/daml.js: $(jsdars)
	$(daml) codegen js $^ -o $@
	@touch $@

.PHONY: $(phony-test-targets)
$(phony-test-targets): build-dars
	@# TODO remove $(PWD)/ when resolved: https://github.com/digital-asset/daml/issues/9646
	$(daml) test --project-root $(project-root) --junit $(PWD)/target/daml-test-reports/$(@F).xml

.SECONDEXPANSION:
$(dars): $$(shell scripts/getDamlDependencies.sh $$(project-root))
	$(daml) build --project-root $(project-root)
