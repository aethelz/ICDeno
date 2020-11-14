import { Application, Router, helpers } from "https://deno.land/x/oak/mod.ts";

import { compress } from "./codecs/oxipng/encoder.ts";
import { defaultOptions, mimeType } from "./codecs/oxipng/encoder-meta.ts";

// import { compress } from "./codecs/webp/encoder.ts";

const port = 3030;

const router = new Router();
router.get("/fetch/:url(.+)", async (ctx) => {
  const { format, q } = helpers.getQuery(ctx, { mergeParams: true });
  const url = ctx.params.url!;
  console.log({ format, q, url });

  const response = await fetch(url);
  if (!response.ok) throw new Error("Response not OK");

  const arrBuf = await response.arrayBuffer();
  console.log('Original LENGTH', arrBuf.byteLength);

  const encoded = await compress(arrBuf, defaultOptions);
  console.log('ENCODED LENGTH', encoded.byteLength);

  const buf = new Uint8Array(encoded!);
  ctx.response.body = buf;
  ctx.response.headers.set("Content-Type", mimeType);
});

const app = new Application();

app.use(async (ctx, next) => {
  await next();
  console.log(
    `
    ${ctx.request.method} ${ctx.request.url}

    SERVER RESPONSE:
    ${ctx.response.status}
`
  );
});
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port });
