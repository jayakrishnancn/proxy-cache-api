import cors from "cors";
import express from "express";
import fs from "fs";
import zlib from "zlib";
import { config } from "./configure";
import { MD5 } from "./hash";
import httpProxy from "http-proxy";

// express server
const proxy = httpProxy.createProxyServer({});
const app = express();
const PORT = config.port ?? 3000;

function getFilePath(req) {
  const name = `${req.method}-${req.url}-${MD5(
    req.body + req.rawHeaders || ""
  )}`;
  const fileName = name.replace(/\W+/g, ".") + ".json";
  return `${config.path}/${fileName}`;
}

function inSkipList(req) {
  const { url = "", method } = req;
  const skipList: string[] = config.skipList || [];
  return skipList.includes(url) || !config.methods.includes(method);
}

function useCache(req, res, next) {
  console.log("Requested: ", req.url);

  if (inSkipList(req)) {
    console.log("Skipping: ", req.url);
    return next();
  }

  const file = getFilePath(req);
  if (fs.existsSync(file)) {
    let output: string | any = fs.readFileSync(file, "utf8");
    output = JSON.parse(output);
    let body: any = output.body;

    res.set({
      "Content-Type":
        typeof body === "object" ? "application/json" : "text/plain",
      ...output.headers,
    });
    console.log(body, output.headers);
    res.send(body);
  } else {
    next();
  }
}

function handleProxtResponse(proxyRes, req, res) {
  const filePath = getFilePath(req);
  let body = "";
  const resArr: any[] = [];
  const isCompressed = proxyRes.headers["content-encoding"] === "gzip";

  proxyRes.on("data", function (chunk) {
    body += chunk;
    resArr.push(chunk);
  });

  proxyRes.on("end", function () {
    const buffer = Buffer.concat(resArr);

    if (isCompressed) {
      body = zlib.gunzipSync(buffer).toString("utf8");
    } else {
      body = buffer.toString("utf-8");
    }

    try {
      body = JSON.parse(body);
    } catch (e) {
      console.debug("cant parse JSON");
    }

    const headers = proxyRes.rawHeaders
      .filter((_, i) => i % 2 === 0)
      .reduce(
        (acc, curr, index, arr) => ({
          ...acc,
          [curr]: arr[index + 1],
        }),
        {}
      );

    headers["content-encoding"] = null;
    fs.writeFileSync(filePath, JSON.stringify({ body, headers }, null, 2));

    res.end(body);
  });
}

function useProxy(req, res) {
  console.log(`Requesting: ${req.method} - ${config.remote.baseUrl}${req.url}`);
  proxy.on("proxyRes", handleProxtResponse);
  proxy.web(req, res, { target: config.remote.baseUrl, secure: config.secure });
}

app.use(cors());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(useCache);
app.use(useProxy);

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
