export const getHeaders = (proxyRes: any) => {
  const rawHeaders = proxyRes.rawHeaders;
  return rawHeaders
    .filter((_, i) => i % 2 === 0)
    .reduce(
      (acc, curr, i) => ({
        ...acc,
        [curr]: rawHeaders[i + 1],
      }),
      {}
    );
};
