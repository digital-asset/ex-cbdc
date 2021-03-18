#
# Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#

# This file was generated with: scripts/makeDeps.sh 
lib-damldir: 
certificates-damldir: lib-damldir
finance-damldir: lib-damldir certificates-damldir
banking-damldir: lib-damldir certificates-damldir finance-damldir
demoadmin-damldir: lib-damldir certificates-damldir finance-damldir banking-damldir
landlord-damldir: lib-damldir certificates-damldir finance-damldir banking-damldir
testing-damldir: lib-damldir certificates-damldir finance-damldir banking-damldir demoadmin-damldir landlord-damldir
triggers-damldir: lib-damldir certificates-damldir finance-damldir banking-damldir
reset-damldir: lib-damldir certificates-damldir finance-damldir banking-damldir demoadmin-damldir landlord-damldir testing-damldir
