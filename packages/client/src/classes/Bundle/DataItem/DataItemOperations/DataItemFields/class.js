import { b64UrlToUint8Array, stringToUint8Array } from '@via-org/data-utils'

import { DataItemTags } from './DataItemTags.js'
import { SIGNATURE_TYPE } from './constants.js'

export class DataItemFields {
  static optional = ['target', 'anchor', 'tags']

  /**
   * DataItemFields functions as an intermediary holding-place for
   * DataItem fields; provides convenience functions to assist in
   * signature creation
   * @param {DataItemBody} body
   * @param {JsonWebKey} key
   */
  constructor(body, key) {
    this.signatureType = new Uint8Array([SIGNATURE_TYPE, 0])
    /** @type {Uint8Array} */
    this.signature = undefined
    this.owner = b64UrlToUint8Array(key.n)
    this.target = null
    this.anchor = null
    this.tags = DataItemTags.toBuffer(body.tags)
    this.data =
      body.data instanceof Uint8Array
        ? body.data
        : stringToUint8Array(body.data)
  }

  /**
   * Reduce all fields existing on `this` into a typed array with
   * accompanying offset values; offsets aren't spec-necessary but handy
   * for later parsing raw values
   * @returns {[DataItemData, DataItemFieldOffsets]}
   */
  toBuffer() {
    let buffer = new Uint8Array(this.length)
    let offsets = /** @type {DataItemFieldOffsets} */ ({})
    let pos = 0

    for (let [field, data] of Object.entries(this)) {
      const length = data?.byteLength || 1
      offsets = { ...offsets, [field]: { pos, length } }
      if (DataItemFields.optional.includes(field)) {
        buffer[pos] = data ? 1 : 0
      }
      if (data) {
        buffer.set(data, pos)
      }
      pos += length
    }

    return [buffer, offsets]
  }

  /**
   * Get the total length (sum of all field lengths); note that if a
   * field is absent, length is counted as 1 (to mark its presence)
   * @returns {number}
   */
  get length() {
    return Object.values(this).reduce(
      (acc, data) => acc + (data?.byteLength || 1),
      0
    )
  }
}
