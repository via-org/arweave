/** @typedef {import('./DataItem/class.js').DataItem} DataItem */

export class Bundle {
  /** @type {TagEntry[]} */
  static DEFAULT_TAGS = [
    ['Bundle-Format', 'binary'],
    ['Bundle-Version', '2.0.0'],
  ]

  /**
   * @param {Uint8Array} data
   * @param {DataItem[]} dataItems
   */
  constructor(data, dataItems) {
    this.data = data
    this.size = data.byteLength
    this.tags = Bundle.DEFAULT_TAGS
    this.items = dataItems
  }

  verify() {
    const results = this.items.map(async item => await item.verify())
    return Promise.all(results).then(bools => bools.every(Boolean))
  }
}
