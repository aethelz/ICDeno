import { optimise } from '../../../codecs/oxipng/pkg/squoosh_oxipng.js';
import { EncodeOptions } from './encoder-meta.ts';

export async function compress(data: ArrayBuffer, options: EncodeOptions): Promise<ArrayBuffer> {
  return optimise(new Uint8Array(data), options.level).buffer;
}
