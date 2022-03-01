import { DEFAULT_ARWEAVE_HOST } from '../constants.js'
import { list } from './list.js'

/**
 * @param {APIHost | string} host
 * @returns {string}
 */
export const getBaseURL = host => {
  if (host instanceof Object) {
    const required = ['host']
    const invalid = required.filter(
      key => /** @type {{ [key: string]: string }} */ (host)[key] === undefined
    )
    if (invalid.length > 0) {
      throw new RangeError(`Missing argument(s): ${list(invalid)}`)
    } else {
      const { protocol, host: hostname, port } = host
      return `${protocol || 'http'}://${hostname}${port ? `:${port}` : ''}`
    }
  } else if (typeof host === 'string') {
    return host
  } else {
    return DEFAULT_ARWEAVE_HOST
  }
}
