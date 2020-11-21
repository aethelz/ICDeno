import { decode, encode, get_size } from "../../../codecs/png/pkg/png_bg.js";
import { ImageData } from "../../../src/types.ts";

export async function decodePNG(png: ArrayBuffer): Promise<ImageData> {
  const u8 = new Uint8Array(png);
  const data = new Uint8ClampedArray(decode(u8).buffer);
  const { width, height } = get_size(u8);
  return {
    data,
    width,
    height,
  };
}
export async function encodePNG({
  data,
  width,
  height,
}: ImageData): Promise<ArrayBuffer> {
  return encode(data, width, height).buffer;
}
