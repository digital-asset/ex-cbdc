#
# Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#

DARS=../banking/.daml/dist/banking-1.0.0.dar\
		 ../certificates/.daml/dist/certificates-1.0.0.dar\
		 ../demoadmin/.daml/dist/demoadmin-1.0.0.dar\
		 ../finance/.daml/dist/finance-1.0.0.dar\
		 ../landlord/.daml/dist/landlord-1.0.0.dar\
		 ../lib/.daml/dist/lib-1.0.0.dar\
		 ../reset/.daml/dist/reset-1.0.0.dar

JS_CODEGEN_DIR=daml.js

build: codegen npminstall eslint

test: build
	npm test -- --watchAll=false --maxWorkers=1

clean:
	rm -rf $(JS_CODEGEN_DIR)
	rm -rf node_modules
	rm -f cbdc-ui.zip
	rm -rf build

### JS Codegen ###

JS_CODEGEN_ARTIFACT=$(JS_CODEGEN_DIR)/landlord-1.0.0/package.json

codegen: $(JS_CODEGEN_ARTIFACT)

$(JS_CODEGEN_ARTIFACT): $(DARS)
	daml codegen js -o $(JS_CODEGEN_DIR) $^

### UI Install ###

UI_INSTALL_ARTIFACT=node_modules

npminstall: $(UI_INSTALL_ARTIFACT)

package-lock.json: $(JS_CODEGEN_ARTIFACT)
	npm install

$(UI_INSTALL_ARTIFACT): package.json package-lock.json $(JS_CODEGEN_ARTIFACT)
	npm install
	touch $(UI_INSTALL_ARTIFACT)

eslint: npminstall
	npm run-script lint -- --max-warnings 0

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
