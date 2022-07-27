/*
 * Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
const { createProxyMiddleware } = require("http-proxy-middleware");
const credentials = require(process.env.REACT_APP_CONFIG_FILE);

const rewriteFn = (partyName) =>
  function (path) {
    return path.replace("/" + partyName, "");
  };

const createProxyMiddlewareHelper = (party) => {
  return createProxyMiddleware(`/${party}/v1/**`, {
    target: process.env.JSON_API_URL,
    ws: true,
    pathRewrite: rewriteFn(party),
    logLevel: "debug",
  });
};

module.exports = function (app) {
  app.use(
    createProxyMiddlewareHelper("renter"),
    createProxyMiddlewareHelper("landlord"),
    createProxyMiddlewareHelper("usFRB"),
    createProxyMiddlewareHelper("ecb"),
    createProxyMiddlewareHelper("bankA"),
    createProxyMiddlewareHelper("bankB"),
    createProxyMiddlewareHelper("demoAdmin"),
    createProxyMiddleware("/v1/**", {
    target: process.env.JSON_API_URL,
    ws: true,
    logLevel: "debug",
    })
  );
};
