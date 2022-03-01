import { stringToUint8Array } from '@via-org/data-utils'
import { Crypto, SHA384 } from '@via-org/arweave-crypto'
import { typeOf } from '@hbauer/convenience-functions'

/** @typedef {(Uint8Array | Uint8Array[])[]} DeepHashListItems */

/**
 * @param {DeepHashListItems} items
 * @returns {[Uint8Array, Uint8Array]}
 */
const listTag = items => [
  stringToUint8Array('list'),
  stringToUint8Array(items.length.toString()),
]

/**
 * @param {Uint8Array} data
 * @returns {[Uint8Array, Uint8Array]}
 */
const blobTag = data => [
  stringToUint8Array('blob'),
  stringToUint8Array(data.byteLength.toString()),
]

/**
 * @param {Uint8Array} data
 * @returns {Promise<Uint8Array>}
 */
const deepHashBlob = async data =>
  Crypto.hash(
    await Promise.all([
      Crypto.hash(blobTag(data), SHA384),
      Crypto.hash(data, SHA384),
    ]),
    SHA384
  )

/**
 * @param {DeepHashListItems} fields
 * @returns {Promise<Uint8Array>}
 */
export const deepHashList = async fields => {
  let hash = await Crypto.hash(listTag(fields), SHA384)

  for (let field of fields) {
    if (typeOf(field) === 'array') {
      hash = await Crypto.hash(
        [hash, await deepHashList(/** @type {Uint8Array[]} */ (field))],
        SHA384
      )
    } else {
      hash = await Crypto.hash(
        [hash, await deepHashBlob(/** @type {Uint8Array} */ (field))],
        SHA384
      )
    }
  }

  return hash
}
