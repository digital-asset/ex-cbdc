#
# Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#

build: npminstall

test: build
	npm run-script lint -- --max-warnings 0
	npm test -- --watchAll=false

clean:
	rm -rf node_modules
	rm -f cbdc-ui.zip
	rm -rf build

JS_CODEGEN_ARTIFACT=daml.js/landlord-1.0.0/package.json

UI_INSTALL_ARTIFACT=node_modules

npminstall: $(UI_INSTALL_ARTIFACT)

package-lock.json: package.json
	npm install

$(UI_INSTALL_ARTIFACT): package.json package-lock.json $(JS_CODEGEN_ARTIFACT)
	npm install
	touch $(UI_INSTALL_ARTIFACT)

daml-hub-package: dabl-parties.json cbdc-ui.zip

UI_SRC=$(shell find src/ -type f)

src/credentials-config.json: participants.json
	./generateDablCredentialsMapJson.py $(LEDGER_ID) > src/credentials-config.json

dabl-parties.json: participants.json
	./generateDablPartiesJson.py participants.json > dabl-parties.json

cbdc-ui.zip: src/credentials-config.json $(UI_INSTALL_ARTIFACT) $(UI_SRC)
	REACT_APP_LEDGER_ID=$(LEDGER_ID) \
    REACT_APP_HTTP_BASE_URL="https://api.projectdabl.com/data/$(LEDGER_ID)/" \
    REACT_APP_IS_LOCAL=false \
    npm run build
	git checkout -- src/credentials-config.json
	rm -f cbdc-ui.zip
	zip --quiet -r cbdc-ui.zip build
