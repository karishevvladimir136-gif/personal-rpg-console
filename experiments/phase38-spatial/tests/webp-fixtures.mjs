export function chunk(kind, payload) {
  const out = Buffer.alloc(8 + payload.length + (payload.length % 2));
  out.write(kind);
  out.writeUInt32LE(payload.length, 4);
  payload.copy(out, 8);
  return out;
}
export function riff(chunks) {
  const out = Buffer.concat([Buffer.alloc(12), ...chunks]);
  out.write("RIFF");
  out.writeUInt32LE(out.length - 8, 4);
  out.write("WEBP", 8);
  return out;
}
export function vp8(width = 2, height = 1) {
  const b = Buffer.alloc(11);
  b.writeUIntLE(0x30, 0, 3);
  b[3] = 0x9d;
  b[4] = 1;
  b[5] = 0x2a;
  b.writeUInt16LE(width, 6);
  b.writeUInt16LE(height, 8);
  return chunk("VP8 ", b);
}
export function vp8l(width = 2, height = 1) {
  const b = Buffer.alloc(6);
  b[0] = 0x2f;
  b.writeUInt32LE(((width - 1) | ((height - 1) << 14)) >>> 0, 1);
  return chunk("VP8L", b);
}
export function vp8x(width = 2, height = 1, flags = 0) {
  const b = Buffer.alloc(10);
  b[0] = flags;
  b.writeUIntLE(width - 1, 4, 3);
  b.writeUIntLE(height - 1, 7, 3);
  return chunk("VP8X", b);
}
export const webp = () => riff([vp8l()]);
