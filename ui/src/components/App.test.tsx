//
// Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { Stream } from "@daml/ledger";

const mockLedgerFunction = jest.fn();

// See: https://discuss.daml.com/t/how-to-mock-usestreamqueries-in-jest-test/2095/2
jest.mock(
  "@daml/ledger",
  () =>
    class {
      streamQueries(
        ...args: unknown[]
      ): Stream<object, string, string, string[]> {
        return {
          ...mockLedgerFunction(...args),
          on: jest.fn(),
          close: jest.fn(),
        };
      }

      getUser() {
        return {
          primaryParty: "mockParty",
        };
      }
    }
);

it("renders without crashing", () => {
  const div = document.createElement("div");
  document.body.appendChild(div);
  ReactDOM.render(
    <Router>
      <App />
    </Router>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
