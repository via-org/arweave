import { DataItemFields } from './DataItemFields/class.js'
import { Signature } from './Signature.js'

export class DataItemOperations {
  /** @private */
  static get sign() {
    return Signature.sign
  }

  /**
   * @param {DataItemBody} body
   * @param {JsonWebKey} key
   */
  static async create(body, key) {
    if (key === undefined) {
      throw new Error(
        'A JsonWebKey (JWK) must be supplied before attempting to create a DataItem'
      )
    }

    // Get fields prepped (signature still missing)
    const fields = new DataItemFields(body, key)
    // Obtain signature
    const { id, signature } = await DataItemOperations.sign(fields, key)
    // Assign signature field
    fields.signature = signature
    // Now that all fields are present, buffer them
    const [data, offsets] = fields.toBuffer()

    return Reflect.construct(this, [id, data, offsets])
  }
}
