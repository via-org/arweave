export class TagByteLengthExceededError extends RangeError {
  /** @param {number} length */
  constructor(length) {
    super()

    this.message = `Computed byte length (${length}) exceeds the maximum for tags of 2048`
  }
}

export class InvalidParameterError extends Error {
  /** @param {string} name */
  constructor(name) {
    super()

    this.message = `Parameter "${name}" is invalid or missing`
  }
}
