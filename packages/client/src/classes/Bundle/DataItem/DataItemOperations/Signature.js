import { Crypto } from '@via-org/arweave-crypto'
import { deepHashList } from '@via-org/deep-hash-list'
import { stringToUint8Array } from '@via-org/data-utils'

import {
  DATA_ITEM_ENTITY,
  DATA_ITEM_FORMAT,
  DATA_ITEM_SIGNATURE_TYPE,
} from './constants.js'

export class Signature {
  /** @param {BundleSignatureFields} item */
  static prepareFields(item) {
    const fields = {
      entity: stringToUint8Array(DATA_ITEM_ENTITY),
      format: stringToUint8Array(DATA_ITEM_FORMAT.toString()),
      signatureType: stringToUint8Array(DATA_ITEM_SIGNATURE_TYPE.toString()),
      owner: item.owner,
      target: item.target || new Uint8Array(),
      anchor: item.anchor || new Uint8Array(),
      tags: item.tags.slice(16) || new Uint8Array(), // TODO: pass non bundle-formated tags into Signature, so slicing isn't necessary
      data: item.data,
    }

    return Object.values(fields)
  }

  /** @param {BundleSignatureFields} fields */
  static generateHash(fields) {
    const preparedFields = Signature.prepareFields(fields)
    return deepHashList(preparedFields)
  }

  /**
   * @param {DataItemFields} fields
   * @param {JsonWebKey} key
   */
  static async sign(fields, key) {
    const hash = await Signature.generateHash(fields)

    const signature = await Crypto.sign(hash, key)
    const id = await Crypto.hash(signature)

    return { id, signature }
  }
}
