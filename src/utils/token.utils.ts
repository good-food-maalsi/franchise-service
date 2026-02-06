export const encodeBase64Key = (key: string) =>
  Buffer.from(key).toString("base64");

export const decodeBase64Key = (key: string) =>
  Buffer.from(key, "base64").toString("utf8");
