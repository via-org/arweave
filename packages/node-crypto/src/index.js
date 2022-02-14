import crypto from 'crypto'
import { concatUint8Arrays } from '@via-org/data-utils'

export class NodeCrypto {
  constructor() {
    /** @type {crypto} */
    this.crypto = crypto
  }

  /**
   * @param {(Uint8Array|Uint8Array[])} data
   * @param {Object} algo
   * @param {string} algo.node
   * @returns {Uint8Array}
   */
  hash(data, algo) {
    const digest = this.crypto
      .createHash(algo?.node || 'sha256')
      .update(Array.isArray(data) ? concatUint8Arrays(data) : data)
      .digest()
    return new Uint8Array(digest)
  }
}
