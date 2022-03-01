import { Crypto } from '@via-org/arweave-crypto'
import { deepHashList } from '@via-org/deep-hash-list'
import { stringToUint8Array, b64UrlToUint8Array } from '@via-org/data-utils'

import {
  TRANSACTION_FORMAT,
  TRANSACTION_TARGET,
  TRANSACTION_QUANTITY,
} from './constants.js'

export class Signature {
  /** @param {TransactionSignatureFields} fields */
  static prepareFields(fields) {
    return Object.values({
      format: stringToUint8Array(TRANSACTION_FORMAT.toString()),
      owner: b64UrlToUint8Array(fields.owner),
      target: TRANSACTION_TARGET,
      quantity: stringToUint8Array(TRANSACTION_QUANTITY.toString()),
      reward: stringToUint8Array(fields.reward),
      last_tx: b64UrlToUint8Array(fields.last_tx),
      tags: fields.tags.map(entry => entry.map(stringToUint8Array)),
      data_size: stringToUint8Array(fields.data.byteLength.toString()),
      data_root: fields.data_root,
    })
  }

  /** @param {TransactionSignatureFields} fields */
  static generateHash(fields) {
    const preparedFields = Signature.prepareFields(fields)
    // @ts-ignore
    return deepHashList(preparedFields)
  }

  /**
   * @param {InternalTransactionFields} fields
   * @param {JsonWebKey} key
   */
  static async sign(fields, key) {
    const hash = await Signature.generateHash(fields)

    const signature = await Crypto.sign(hash, key)
    const id = await Crypto.hash(signature)

    return { id, signature }
  }
}
