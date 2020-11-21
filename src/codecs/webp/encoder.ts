import webp_enc from "../../../codecs/webp/enc/webp_enc.js";
import { WebPModule } from "../../../codecs/webp/enc/webp_enc.d.ts";
import { EncodeOptions } from "./encoder-meta.ts";
import { initEmscriptenModule } from "../util.ts";
import { ImageData } from "../../types.ts";

let emscriptenModule: Promise<WebPModule>;

export async function encode(
  data: ImageData,
  options: EncodeOptions
): Promise<ArrayBuffer> {
  if (!emscriptenModule)
    emscriptenModule = initEmscriptenModule(
      webp_enc,
      "codecs/webp/enc/webp_enc.wasm"
    );

  const module = await emscriptenModule;
  const result = module.encode(data.data, data.width, data.height, options);
  if (!result) {
    throw new Error("Encoding error.");
  }
  // wasm can’t run on SharedArrayBuffers, so we hard-cast to ArrayBuffer.
  return result.buffer as ArrayBuffer;
}
