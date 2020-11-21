import { Application, Router, helpers } from "https://deno.land/x/oak/mod.ts";
import { SupportedFormats, ImageData } from "./types.ts";
import { getSizeDifference } from "./utils.ts";

import { compress as compressPNG } from "./codecs/oxipng/encoder.ts";
import {
  defaultOptions as oxiDefaultOptions,
  mimeType as pngMimeType,
} from "./codecs/oxipng/encoder-meta.ts";
import {
  defaultOptions as webpDefaultOptions,
  mimeType as webpMimeType,
} from "./codecs/webp/encoder-meta.ts";

import { decodePNG, encodePNG } from "./codecs/png/decoder.ts";

import { process } from "./codecs/imagequant/processor.ts";
import { defaultOptions as quantDefaultOptions } from "./codecs/imagequant/processor-meta.ts";

import { encode as encodeWEPB } from "./codecs/webp/encoder.ts";

const port = 3030;

const router = new Router();
router.get<{ url: string; format: SupportedFormats }>(
  "/:format/:url(.+)",
  async (ctx) => {
    const { fast, q, colors, dither, lossless } = helpers.getQuery(ctx, {
      mergeParams: true,
    });
    const { url, format } = ctx.params;
    if (!["png", "webp"].includes(format)) {
      ctx.response.status = 400;
      ctx.response.body = "Unsupported output format";
      return;
    }
    const isWEBP = format === "webp";

    let response: Response;
    try {
      console.time("FETCHING");
      response = await fetch(url);
      if (!response.ok) {
        ctx.response.status = 404;
        ctx.response.body = `Image fetch failed: ${response.status}`;
        return;
      }
      const contentType = response.headers.get("content-type");
      if (contentType !== pngMimeType) {
        ctx.response.status = 400;
        ctx.response.body = "Provided URL is not a png image";
        return;
      }
    } catch (e) {
      ctx.response.status = 404;
      ctx.response.body = "Network failure when fetching image";
      return;
    } finally {
      console.timeEnd("FETCHING");
    }

    let arrBuf: ArrayBuffer;
    let decodedImage: ImageData;
    try {
      console.time("DECODING");
      arrBuf = await response.arrayBuffer();
      decodedImage = await decodePNG(arrBuf);
    } catch (e) {
      ctx.response.status = 406;
      ctx.response.body = `Error ${e} when getting image data`;
      return;
    } finally {
      console.timeEnd("DECODING");
    }

    let quantized: ImageData;
    try {
      console.time("QUANTIZING");
      quantized =
        colors || dither
          ? await process(decodedImage, {
              ...quantDefaultOptions,
              maxNumColors: Number(colors) || 256,
              dither: Number(dither) || 1,
            })
          : decodedImage;
    } catch (e) {
      ctx.response.status = 406;
      ctx.response.body = `Error ${e} when decoding image data`;
      return;
    } finally {
      console.timeEnd("QUANTIZING");
    }

    let rawEncodedImage: ArrayBuffer;
    let result: ArrayBuffer;
    try {
      console.time("ENCODING");
      rawEncodedImage = isWEBP
        ? await encodeWEPB(quantized, {
            ...webpDefaultOptions,
            quality: Number(q) || 75,
            lossless: Number(typeof lossless === "string") || 0,
          })
        : await encodePNG(quantized);
      console.timeEnd("ENCODING");

      console.time("POSTPROCESSING");
      result =
        !isWEBP && typeof fast !== "string"
          ? await compressPNG(rawEncodedImage, oxiDefaultOptions)
          : rawEncodedImage;
    } catch (e) {
      ctx.response.status = 406;
      ctx.response.body = `Error ${e} when encoding image`;
      return;
    } finally {
      console.timeEnd("POSTPROCESSING");
    }

    const body = new Uint8Array(result);

    console.log(
      `${getSizeDifference(arrBuf.byteLength, body.byteLength)}! Original: ${
        arrBuf.byteLength
      }, Encoded: ${body.byteLength}`
    );

    ctx.response.body = body;
    ctx.response.headers.set(
      "Content-Type",
      isWEBP ? webpMimeType : pngMimeType
    );
  }
);

const app = new Application();

app.use(async (ctx, next) => {
  await next();
  console.log(
    `
    ${ctx.request.method} ${ctx.request.url}

    SERVER RESPONSE: ${ctx.response.status}
`
  );
});
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port });
