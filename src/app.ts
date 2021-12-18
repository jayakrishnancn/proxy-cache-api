import fs from "fs";
import {
  getFileName,
  getHeaders,
  getRequestBody,
  shouldCacheRequest,
  stringToFileName,
} from "./serverUtils";

var http = require("http"),
  httpProxy = require("http-proxy");

const proxy = httpProxy.createProxyServer({ target: "http://localhost:9000" });

proxy.on("proxyReq", function (proxyReq, req, res, options) {
  if (!shouldCacheRequest(req)) {
    return;
  }
  proxyReq.end();
  // set cors headers
  const resHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Max-Age": 2592000, // 30 days
  };

  if (req.method === "OPTIONS") {
    res.writeHead(204, resHeaders);
    res.end();
    return;
  }
  getRequestBody(req);
  req.on("end", () => {
    const fileName = getFileName(req);
    // const fileContent = getFileContent(fileName, req.stringBody);
    if (true) {
      console.log("writing to file", fileName);

      res.end();
    }
  });
  // console.log("RAW Request from the source", JSON.stringify(fileName, null, 2));
});

proxy.on("proxyRes", function (proxyRes, req, res) {
  // cache files
});
//

proxy.listen(8000);

// TODO: remove this
// Create your target server
//
http
  .createServer(function (req, res) {
    console.log("triggered remote server");
    res.writeHead(200, { "Content-Type": "text/plain" });
    getRequestBody(req);
    req.on("end", () => {
      res.write(
        "request successfully proxied!" +
          "\n" +
          JSON.stringify(req.headers, null, 2) +
          JSON.stringify(req.stringBody, null, 2)
      );
      res.end();
    });
  })
  .listen(9000);
