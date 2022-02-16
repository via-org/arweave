import asn from '@panva/asn1.js'

/**
 * @param {string} b64
 * @returns {BigInt}
 */
const base64ToBignum = b64 => {
  const binary = Buffer.from(b64, 'base64').toString('binary')
  const hex = []

  for (let i = 0; i < binary.length; i++) {
    let h = binary[i].charCodeAt(0).toString(16)
    if (h.length % 2) h = '0' + h
    hex.push(h)
  }

  return BigInt('0x' + hex.join(''))
}

const Version = asn.define('Version', function () {
  this.int({
    0: 'two-prime',
    1: 'multi',
  })
})

const OtherPrimeInfos = asn.define('OtherPrimeInfos', function () {
  this.seq().obj(
    this.key('ri').int(),
    this.key('di').int(),
    this.key('ti').int()
  )
})

const RSAPrivateKey = asn.define('RSAPrivateKey', function () {
  this.seq().obj(
    this.key('version').use(Version),
    this.key('n').int(),
    this.key('e').int(),
    this.key('d').int(),
    this.key('p').int(),
    this.key('q').int(),
    this.key('dp').int(),
    this.key('dq').int(),
    this.key('qi').int(),
    this.key('other').optional().use(OtherPrimeInfos)
  )
})

/**
 * @param {JsonWebKey} jwk
 * @returns {{ [key: string]: BigInt | string }}
 */
const parse = jwk => ({
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
  const jwk = parse(json)
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
