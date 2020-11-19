import {
  decode,
  encode,
  get_size,
} from "../../../codecs/png/pkg/png_bg.js";

export async function decodePNG(data: ArrayBuffer): Promise<ArrayBuffer> {
  return decode(new Uint8Array(data)).buffer;
}
export async function getSize(data: ArrayBuffer) {
  return get_size(new Uint8Array(data));
}
export async function encodePNG(
  data: ArrayBuffer,
  width: number,
  height: number
): Promise<ArrayBuffer> {
  return encode(new Uint8Array(data), width, height).buffer;
}
