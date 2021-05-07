# Reference Application: Central Bank Digital Currency (CBDC)

- [Overview](#overview)
- [Getting Started with Sandbox](#getting-started-with-sandbox)
  - [Installing](#installing)
  - [Prerequisites](#prerequisites)
  - [Starting the App](#starting-the-app)
  - [Stopping the App](#stopping-the-app)
  - [Resetting the Prototype](#resetting-the-prototype)
  - [Resetting the Prototype with the Experimental Reset Service](#resetting-the-prototype-with-the-experimental-reset-service)
- [Getting Started with Daml Hub](#getting-started-with-daml-hub)
- [Getting Started with Canton](#getting-started-with-canton)
- [Running the Demo](#running-the-demo)
- [Notes for Developers](#notes-for-developers)
  - [Model](#model)
  - [Debugging with Navigator](#debugging-with-navigator)

## Overview

Refer to the [User Guide] for details on the features shown in this application along with detailed instructions on running the demo.

The demo shows how Daml supports core features of CBDC, addressing these key requirements:
* **Tracking**: Daml supports auditing and tracking transactions and storing contracts along with the history of each transaction. Observers of a Daml contract can be customized to allow for more transparency and visibility.
* **Controls**: An authority controls who can own money at a programmatic level, for example, to comply with restricted lists (e.g., OFAC).
* **Safety**: For simple or complicated transactions, Daml can establish specific rules for money transfers that must be met atomically (e.g., all steps must be successful) for the transaction to occur.
* **Interoperability**: Daml would permit a CBDC system to bridge different ledgers and technologies.

## Getting Started with Sandbox

### Installing

**Disclaimer:** This reference application is intended to demonstrate the capabilities of Daml. We recommend that you consider other non-functional aspects, such as security, resiliency, recoverability, etc., prior to production use.

### Prerequisites
- [Daml SDK](https://docs.daml.com/)
- Make
- Python 3
- Node v14
- Yq (hint: `pip3 install yq`)
- Mvn (optional, for running the tests)

### Starting the App

1. To build the App, enter:
   ```shell
   make build
   ```
   Notes:
   * If you change the DAML models locally, you need to re-run this command before starting the application.
   * See the [Makefile](Makefile) for other available targets.

1. Use **separate terminals** to launch the individual components:

   ```shell
   launchers/sandbox
   launchers/jsonapi
   launchers/automation
   launchers/ui
   ```

1. Use the following script to initialize the ledger:
   ```
   launchers/populate
   ```

The demo will run at http://localhost:3000

### Stopping the App

1. Stop the every running command by pressing **Ctrl+C**.

### Resetting the Prototype

To reset the application:
1.  Stop the app by following the steps in [Stopping the App](#stopping-the-app) section.
1.  Start the app by following the steps in [Starting the App](#starting-the-app) section.

### Resetting the Prototype with the Experimental Reset Service

*Note:* we only provide reset instructions for Sandbox. It can easily be configured for any other infrastructure.

1. Start the reset service.
   Use the adequate party-participant configs. For example when working with [Sandbox](#getting-started-with-daml-hub) use the following:
   ```
   launchers/resetService parties.json default_participant_config.cfg
   ```
   *Note:* the `parties.json` file is created when the ledger is [initialized](#starting-the-app).

2.  Click on the **Reload** button.


## Getting Started with Daml Hub

1. Create a project and a ledger on Daml Hub
2. Add the parties to the ledger
   - Alice
   - BankA
   - BankB
   - DemoAdmin
   - ECB
   - Landlord
   - LandlordsAssociation
   - USFRB
3. Download `participants.json` from the ledger settings to the [ui] folder
4. Download the `parties.json` from the users tab to the [ui] folder
5. Build the DABL version of the project
   ```shell
   make daml-hub-package LEDGER_ID=[Ledger ID]
   ```

    The ledger ID can be found on the ledger settings.
6. Upload the artifacts and deploy them to the ledger
   - testing/.daml/dist/testing-1.0.0.dar
   - triggers/.daml/dist/triggers-1.0.0.dar
   - reset/.daml/dist/reset-1.0.0.dar
   - ui/cbdc-ui.zip
7.  Run the ledger setup
    ```shell
    scripts/ledger-setup.sh ui/participants.json ui/dabl-parties.json --json-api
    ```

The demo will run at the location provided by Daml Hub.

## Getting Started with Canton

Make sure Canton is installed and `canton` can be found in the PATH.
Launch Canton and wait until it fully starts in order to have the generated configs:
```
launchers/canton/ledgers
```
After you see the message `Welcome to Canton!`, launch everything else:
```
launchers/canton/populate && launchers/canton/automation
launchers/canton/jsonapis
launchers/canton/ui
```
The demo will run in http://localhost:3000

## Running the Demo

Refer to the [User Guide] for instructions on running the demo.

## Notes for Developers

### Model
For each DVP, the model creates a dedicated a settlement rule and an instruction. The DVP ID assumes that there can only be USD-EUR trades. Settlement rules also have IDs based on the master agreement. See the Daml templates for details.

### Debugging with Navigator
Visualization using Navigator (development UI):
```
daml navigator server localhost 6865 --port 7500
```
Then open http://localhost:7500.


CONFIDENTIAL © 2021 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
Any unauthorized use, duplication or distribution is strictly prohibited.

[ui]: ui
[User Guide]: CBDC_Demo_User_Guide.pdf
