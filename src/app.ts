import { getHeaders } from "./serverUtils";

var http = require("http"),
  httpProxy = require("http-proxy");

const proxy = httpProxy.createProxyServer({ target: "http://localhost:9000" });
proxy.on("proxyReq", function (proxyReq, req, res, options) {});

proxy.on("proxyRes", function (proxyRes, req, res) {
  console.log(
    "RAW Response from the target",
    JSON.stringify(getHeaders(proxyRes), null, 2)
  );
});
//

proxy.listen(8000);

// TODO: remove this
// Create your target server
//
http
  .createServer(function (req, res) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.write(
      "request successfully proxied!" +
        "\n" +
        JSON.stringify(req.headers, null, 2)
    );
    res.end();
  })
  .listen(9000);
