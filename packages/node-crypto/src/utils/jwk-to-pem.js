import { base64ToBignum } from './data.js'
import { RSAPrivateKey } from './asn.js'

/**
 * @param {JsonWebKey} jwk
 * @returns {{ [key: string]: BigInt | string }}
 */
const parseJson = jwk => ({
  n: base64ToBignum(jwk.n),
  e: base64ToBignum(jwk.e),
  d: jwk.d && base64ToBignum(jwk.d),
  p: jwk.p && base64ToBignum(jwk.p),
  q: jwk.q && base64ToBignum(jwk.q),
  dp: jwk.dp && base64ToBignum(jwk.dp),
  dq: jwk.dq && base64ToBignum(jwk.dq),
  qi: jwk.qi && base64ToBignum(jwk.qi),
})

/**
 * @param {JsonWebKey} json
 * @returns {string}
 */
export const jwkToPem = json => {
  const jwk = parseJson(json)
  const t = 'PRIVATE'
  const header = `-----BEGIN RSA ${t} KEY-----\n`
  const footer = `\n-----END RSA ${t} KEY-----\n`
  let data = Buffer.alloc(0)
  jwk.version = 'two-prime'
  data = RSAPrivateKey.encode(jwk, 'der')
  const body = data
    .toString('base64')
    .match(/.{1,64}/g)
    .join('\n')
  return header + body + footer
}
