import {
  stringToB64Url,
  uint8ArrayToB64Url,
  stringToUint8Array,
  b64UrlToUint8Array,
} from '@via-org/data-utils'
import { Crypto } from '@via-org/arweave-crypto'

import { TagByteLengthExceededError } from '../../errors.js'
import { Signature } from './TransactionSupport/Signature/class.js'

export class Transaction {
  /** @type {{ items: Chunk[], proofs: LeafProof[], length: number }} */
  chunks
  /** @type {Uint8Array} */
  _encodedData
  /** @type {InternalTransactionFields} */
  _fields

  /**
   * @param {PublicTransactionFields} fields
   * @param {{ chunks: Chunk[], proofs: LeafProof[] }} aux
   */
  constructor(fields, aux) {
    Object.defineProperty(this, '_encodedData', {
      enumerable: false,
      value:
        fields.data instanceof Uint8Array
          ? fields.data
          : stringToUint8Array(fields.data),
    })

    this.format = 2
    this.id = uint8ArrayToB64Url(fields.id)
    this.last_tx = fields.last_tx
    this.owner = fields.owner
    this.tags = fields.tags.map(([name, value]) => ({ name, value }))
    this.target = ''
    this.quantity = 0
    this.data_root = uint8ArrayToB64Url(fields.data_root)
    this.data_size = this._encodedData.byteLength
    this.data = fields.data
    this.reward = Number(fields.reward)
    this.signature = uint8ArrayToB64Url(fields.signature)

    Object.defineProperty(this, 'chunks', {
      enumerable: false,
      value: {
        items: aux.chunks,
        proofs: aux.proofs,
        length: aux.chunks.length,
      },
    })

    Object.defineProperty(this, '_fields', {
      enumerable: false,
      value: { ...fields, data: this._encodedData },
    })
  }

  async verify() {
    // Ensure tags come in under max byte length
    const tagsByteLength = this._fields.tags
      .flat()
      .reduce((acc, val) => acc + stringToUint8Array(val).length, 0)
    if (tagsByteLength > 2048)
      throw new TagByteLengthExceededError(tagsByteLength)

    // Ensure signature-derived ID matches existing ID
    const rawId = await Crypto.hash(this._fields.signature)
    const id = uint8ArrayToB64Url(rawId)
    if (this.id !== id) return false

    // Ensure signature is authentic
    const hash = await Signature.generateHash({
      owner: this.owner,
      reward: String(this.reward),
      last_tx: this.last_tx,
      tags: this.tags.map(({ name, value }) => [name, value]),
      data: this._encodedData,
      data_root: b64UrlToUint8Array(this.data_root),
    })
    return Crypto.verify(this.owner, hash, this._fields.signature)
  }

  toJSON() {
    return {
      ...Object.assign({}, this),
      quantity: this.quantity.toString(),
      data_size: this.data_size.toString(),
      data: uint8ArrayToB64Url(this._encodedData),
      reward: this.reward.toString(),
      tags: this.tags.map(({ name, value }) => ({
        name: stringToB64Url(name),
        value: stringToB64Url(value),
      })),
    }
  }
}
