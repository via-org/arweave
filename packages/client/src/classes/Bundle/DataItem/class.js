import { Crypto } from '@via-org/arweave-crypto'
import { uint8ArrayToB64Url } from '@via-org/data-utils'
import { TagByteLengthExceededError } from '../../../errors.js'
import { uint8ArrayToLong } from '../utils/uint8array-to-long.js'
import { DataItemOperations } from './DataItemOperations/class.js'
import { Signature } from './DataItemOperations/Signature.js'

import { DEFAULT_DATA_ITEM_OFFSETS } from './constants.js'

/** @implements {DataItemOperations} */
export class DataItem extends DataItemOperations {
  /**
   * @param {Uint8Array} id
   * @param {Uint8Array} data
   * @param {DataItemFieldOffsets} offsets
   */
  constructor(id, data, offsets) {
    super()

    this.id = id
    this.data = data

    /** @type {DataItemFieldOffsets} */
    this.offsets = {
      ...DEFAULT_DATA_ITEM_OFFSETS,
      ...offsets,
    }
  }

  /** @param {ComputableDataItemField} field */
  get(field) {
    const { pos, length } = this.offsets[field]
    return this.data.slice(pos, pos + length)
  }

  async verify() {
    // Ensure tags come in under max byte length
    const tagsBuffer = this.get('tags')
    const tagsByteLength = uint8ArrayToLong(tagsBuffer.slice(8, 16))
    if (tagsByteLength > 2048)
      throw new TagByteLengthExceededError(tagsByteLength)

    // Ensure signature is authentic
    const hash = await Signature.generateHash({
      owner: this.get('owner'),
      tags: this.get('tags'),
      data: this.get('data'),
    })
    return Crypto.verify(
      uint8ArrayToB64Url(this.get('owner')),
      hash,
      this.get('signature')
    )
  }
}
