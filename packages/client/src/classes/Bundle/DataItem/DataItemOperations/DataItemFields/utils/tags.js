import { createType } from '@via-org/avsc'

export const Tags = createType({
  type: 'array',
  items: createType({
    type: 'record',
    name: 'Tag',
    fields: [
      { name: 'name', type: 'string' },
      { name: 'value', type: 'string' },
    ],
  }),
})

/**
 * Serialize tags using Avro (https://avro.apache.org)
 * @param {TagObject[]} tags
 * @returns {Uint8Array}
 */
export const encodeTags = tags => {
  if (tags.length == 0) return new Uint8Array(0)
  try {
    return Tags.toBuffer(tags)
  } catch {
    throw new Error(
      'Incorrect tag format used. Ensure the following schema is satisfied:  { name: string!, name: string! }[]'
    )
  }
}

/**
 * Deserialize tags
 * @param {Uint8Array} tagsBuffer
 * @returns {TagObject[]}
 */
export const decodeTags = tagsBuffer => Tags.fromBuffer(tagsBuffer)
