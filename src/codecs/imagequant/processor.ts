import imagequant from "../../../codecs/imagequant/imagequant.js";
import { QuantizerModule } from "../../../codecs/imagequant/imagequant.d.ts";

import { QuantizeOptions } from "./processor-meta.ts";
import { initEmscriptenModule } from "../util.ts";
import type { ImageData } from "../../../src/types.ts";

let emscriptenModule: Promise<QuantizerModule>;

export async function process(
  data: ImageData,
  opts: QuantizeOptions
): Promise<ImageData> {
  if (!emscriptenModule)
    emscriptenModule = initEmscriptenModule(
      imagequant,
      "codecs/imagequant/imagequant.wasm"
    );

  const module = await emscriptenModule;
  const result = opts.zx
    ? module.zx_quantize(data.data, data.width, data.height, opts.dither)
    : module.quantize(
        data.data,
        data.width,
        data.height,
        opts.maxNumColors,
        opts.dither
      );
  return { data: result, width: data.width, height: data.height };
}
