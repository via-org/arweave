/**
 * @param {number} long
 * @param {number} length
 */
export const longToUint8Array = (long, length = 8) => {
  const buffer = new Uint8Array(length)

  for (let i = 0; i < buffer.length; i++) {
    const byte = long & 0xff
    buffer[i] = byte
    long = (long - byte) / 256
  }

  return buffer
}
