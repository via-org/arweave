import { concatUint8Arrays } from '@via-org/data-utils'
import { longToUint8Array } from '../../../utils/long-to-uint8array.js'
import { decodeTags, encodeTags } from './utils/tags.js'

/**
 * A convenience class serving to aid in more complex tag serialization operations
 */
export class DataItemTags {
  /** @param {Uint8Array} tagsBuffer */
  static fromBuffer(tagsBuffer) {
    return decodeTags(tagsBuffer)
  }

  /** @param {TagEntry[]} entries */
  static toBuffer(entries) {
    // NOTE: for reference, in buffer-form tags take on:
    //   [].concat(
    //     unencoded.length[alloc(8)] +
    //     encoded.length[alloc(8)] +
    //     encoded.tags[alloc(dependent)]
    //   ).length === 8 + 8 + encoded.byteSize
    const tagsLength = longToUint8Array(entries.length)
    const tagObjects = entries.map(([name, value]) => ({ name, value }))
    const encodedTags = encodeTags(tagObjects)
    const encodedTagsLength = longToUint8Array(encodedTags.byteLength)

    return concatUint8Arrays([tagsLength, encodedTagsLength, encodedTags])
  }
}
