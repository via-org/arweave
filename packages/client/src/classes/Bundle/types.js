/**
 * DataItem
 */

/** @typedef {import('./DataItem/class.js').DataItem} DataItem */
/** @typedef {import('./DataItem/DataItemOperations/DataItemFields/class.js').DataItemFields} DataItemFields */

/**
 * @typedef {Object} DataItemBody
 * @prop {string | Uint8Array} data
 * @prop {TagEntry[]} [tags]
 */

/**
 * @typedef {Object} DataItemOffset
 * @prop {number} pos
 * @prop {number} length
 */

/**
 * @typedef {Object} DataItemFieldOffsets
 * @type {{ [field: string]: DataItemOffset }}
 */

/** @typedef {Uint8Array} DataItemData */

/** @typedef {"signatureType"|'signature'|'owner'|'target'|'anchor'|'tags'|'data'} ComputableDataItemField */

/**
 * Bundle
 */

/** @typedef {Uint8Array} BundleData */

/**
 * @typedef {Object} BundleSignatureFields
 * @prop {Uint8Array} owner
 * @prop {Uint8Array} [target]
 * @prop {Uint8Array} [anchor]
 * @prop {Uint8Array} tags
 * @prop {Uint8Array} data
 */
