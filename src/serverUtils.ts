import { MD5 } from "./hash";

export const getHeaders = (proxyRes: any) => {
  const rawHeaders = proxyRes.rawHeaders;
  return rawHeaders
    ?.filter((_, i) => i % 2 === 0)
    .reduce(
      (acc, curr, i) => ({
        ...acc,
        [curr]: rawHeaders[i + 1],
      }),
      {}
    );
};

export const getRequestBody = (req: any) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", () => {
    var result;
    try {
      result = JSON.parse(body);
    } catch (ex) {
      result = "";
    }
    req.stringBody = result;
  });
};

export const stringToFileName = (s: string): string =>
  s.replace(/[^a-z0-9-]/gi, "_").toLowerCase();

export const shouldCacheRequest = (req: any) =>
  true ||
  ["GET"].includes(req.method) ||
  req.headers["content-type"] === "application/json";

export const getFileName = (req: any) => {
  const headers = JSON.stringify(getHeaders(req));
  const hash = MD5(headers + "-" + req.stringBody);
  return stringToFileName(`${req?.url}-${req?.method}-${hash}.json`);
};
