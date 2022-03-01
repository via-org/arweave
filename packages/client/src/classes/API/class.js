import fetch from 'cross-fetch'
import { buildURL } from '@hbauer/convenience-functions'
import { getBaseURL } from './utils/get-base-url.js'

export class API {
  /** @param {APIHost} host */
  constructor(host) {
    this.baseURL = getBaseURL(host)
  }

  /** @param {string} path */
  buildURL(path) {
    return buildURL({ host: this.baseURL, path })
  }

  /**
   * @param {[RequestInfo, RequestInit?]} args
   * @returns {Promise<TransactionResponseStatus>}
   */
  async request(...args) {
    const response = await fetch(...args)
    if (!response.ok) {
      let code
      let message = ''
      try {
        const json = await response.json()
        code = json.code
        message += json.status || json.msg
      } catch {
        code = response.status
        message = response.statusText
      }
      throw {
        ok: false,
        code,
        body: `HTTP request to ${args[0]} failed: ${message}`,
      }
    }
    return {
      ok: true,
      code: response.status,
      body: await response.text().then(text =>
        Promise.resolve(text)
          .then(JSON.parse)
          .catch(() => text)
      ),
    }
  }

  /**
   * @param {string} path
   * @returns {Promise<TransactionResponseStatus>}
   */
  get(path) {
    const url = this.buildURL(path).href
    return this.request(url)
  }

  /**
   * @param {string} path
   * @param {{ data: any }} opts
   * @returns {Promise<TransactionResponseStatus>}
   */
  post(path, { data }) {
    const url = this.buildURL(path).href

    const init = {
      method: 'post',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    }

    return this.request(url, init)
  }
}
