import { concatUint8Arrays } from '@via-org/data-utils'

import { Bundle } from './class.js'
import { DataItem } from './DataItem/class.js'

import { longToUint8Array } from './utils/long-to-uint8array.js'
import { uint8ArrayToLong } from './utils/uint8array-to-long.js'

export class BundleSupport {
  /**
   * @protected Parse bundle binary data into a Bundle instance
   * @param {BundleData} bundleData
   * @example
   *   const bundle = await client.bundles.create([itemA, itemB], key)
   *   const unpackedBundle = client.bundles.unpack(bundle.data)
   *   assert.equal(bundle, unpackedBundle)
   */
  unpack(bundleData) {
    const itemsLength = uint8ArrayToLong(bundleData.slice(0, 32))
    const headerList = bundleData.slice(32, 64 * itemsLength + 32)
    const items = []
    for (let x = 0, y = 32 + headerList.length; x < itemsLength; x++) {
      const header = headerList.slice(x * 64, x * 64 + 64)
      const itemByteLength = uint8ArrayToLong(header.slice(0, 32))
      const id = header.slice(32, 64)
      const itemData = bundleData.slice(y, (y += itemByteLength))
      const tagsByteLength = uint8ArrayToLong(itemData.slice(1036, 1044))
      const offsets = {
        tags: { pos: 1028, length: 16 + tagsByteLength },
        data: {
          pos: 1028 + 16 + tagsByteLength,
          length: itemData.length - (1028 + 16 + tagsByteLength),
        },
      }
      items.push(new DataItem(id, itemData, offsets))
    }
    return new Bundle(bundleData, items)
  }

  /**
   * @protected Produce a bundle given an arbitrary number of data items
   * @param {DataItem[]} dataItems
   * @example
   *   const itemA = new DataItem(idA, dataA, offsetsA)
   *   const itemB = new DataItem(idB, dataB, offsetsB)
   *   const bundle = client.bundles.pack([itemA, itemB])
   */
  pack(dataItems) {
    const headerList = new Uint8Array(64 * dataItems.length)

    for (let [i, dataItem] of dataItems.entries()) {
      // Loop over a data item and create a header; add header to header list
      // For reference, a header is:
      //   [].concat(
      //     item.length[alloc(32)],
      //     item.id[alloc(32)]
      //   )
      const header = new Uint8Array(64)
      header.set(longToUint8Array(dataItem.data.byteLength, 32), 0)
      header.set(dataItem.id, 32)
      headerList.set(header, i * 64)
    }

    const dataItemsLength = longToUint8Array(dataItems.length, 32)
    const dataItemsData = concatUint8Arrays(dataItems.map(({ data }) => data))

    // Tada
    const data = concatUint8Arrays([dataItemsLength, headerList, dataItemsData])

    return new Bundle(data, dataItems)
  }
}
