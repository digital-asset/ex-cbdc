///
/// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
/// SPDX-License-Identifier: Apache-2.0
///

export type CommercialData = {
  centralBank: string | null;
  transactionError: boolean | null;
  list: { label: string; value: string }[];
};
