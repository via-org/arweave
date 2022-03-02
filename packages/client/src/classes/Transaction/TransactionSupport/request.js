import { pass } from '@hbauer/convenience-functions'
import { b64UrlToUint8Array } from '@via-org/data-utils'

/** @param {API} api */
export const request = api => ({
  anchor: () =>
    api
      .get('tx_anchor')
      .then(({ body }) => body)
      .catch(pass),

  /** @param {number} length */
  reward: length =>
    api
      .get(`price/${length}`)
      .then(({ body }) => body)
      .catch(pass),

  /** @param {TransactionID} id */
  status: id =>
    api
      .get(`tx/${id}/status`)
      .then(({ body }) => body)
      .catch(pass),

  /** @param {TransactionID} id */
  data: id =>
    api
      .get(`tx/${id}/data.json`)
      .then(({ body }) => body)
      .catch(pass),

  /** @param {TransactionID} id */
  offset: id =>
    api
      .get(`tx/${id}/offset`)
      .then(({ body }) => ({
        start: Number(body.offset),
        length: Number(body.size),
      }))
      .catch(pass),

  /** @param {number} offset */
  chunk: offset =>
    api
      .get(`chunk/${offset}`)
      .then(({ body }) => b64UrlToUint8Array(body.chunk)),

  /** @param {TransactionID} id */
  cachedData: id =>
    api
      .get(id)
      .then(({ body }) => body)
      .catch(pass),

  /**
   * @param {*} data
   * @returns {Promise<TransactionResponseStatus>}
   */
  postTransaction: data => api.post('tx', { data }).catch(pass),

  /** @param {*} chunk */
  postChunk: chunk => api.post('chunk', { data: chunk }).catch(pass),
})
