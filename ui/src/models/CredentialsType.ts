///
/// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
/// SPDX-License-Identifier: Apache-2.0
///

export class PartyId {
  private value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static from(value: string): PartyId {
    return new PartyId(value);
  }

  asString(): string {
    return this.value;
  }

  equals(partyId: PartyId): boolean {
    return this.value === partyId.value;
  }
}
