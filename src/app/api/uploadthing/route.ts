import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

function getUploadThingToken(): string | undefined {
  if (process.env.UPLOADTHING_TOKEN) return process.env.UPLOADTHING_TOKEN;
  const secret = process.env.UPLOADTHING_SECRET;
  const appId = process.env.UPLOADTHING_APP_ID;
  if (secret && appId) {
    const payload = { apiKey: secret, appId, regions: ["sea1"] };
    return Buffer.from(JSON.stringify(payload)).toString("base64");
  }
  return undefined;
}

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: { token: getUploadThingToken() },
});
