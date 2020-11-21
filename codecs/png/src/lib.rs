mod malloc_shim;

use wasm_bindgen::prelude::*;
use wasm_bindgen::Clamped;

#[wasm_bindgen]
pub struct ImageSize {
    pub width: u32,
    pub height: u32,
}

#[wasm_bindgen(catch)]
pub fn decode(data: &[u8]) -> Vec<u8> {
    let decoder = png::Decoder::new(data);
    let (info, mut reader) = decoder.read_info().unwrap();
    let mut buf = vec![0; info.buffer_size()];
    reader.next_frame(&mut buf).unwrap();
    buf
}

#[wasm_bindgen(catch)]
pub fn get_size(data: &[u8]) -> ImageSize {
    let decoder = png::Decoder::new(data);
    let (info, _) = decoder.read_info().unwrap();
    let png::OutputInfo { width, height, .. } = info;
    ImageSize { width, height }
}

#[wasm_bindgen(catch)]
pub fn encode(data: Clamped<Vec<u8>>, width: u32, height: u32) -> Vec<u8> {
    let mut buf = Vec::new();

    {
        let mut encoder = png::Encoder::new(&mut buf, width, height);
        encoder.set_color(png::ColorType::RGBA);
        encoder.set_depth(png::BitDepth::Eight);
        encoder.set_compression(png::Compression::Fast);
        let mut writer = encoder.write_header().unwrap();
        writer.write_image_data(&data).unwrap();
    }
    buf
}
