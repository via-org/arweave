import {
  RSAPrivateKey,
  RSAPublicKey,
  PrivateKeyInfo,
  PublicKeyInfo,
} from './asn.js'
import { pad, hexToBase64Url, bignumToBase64Url } from './data.js'

/**
 * @param {*} buffer
 * @param {*} extras
 */
const decodeRsaPublic = (buffer, extras) => {
  var key = RSAPublicKey.decode(buffer, 'der')
  var e = pad(key.e.toString(16))
  var jwk = {
    kty: 'RSA',
    n: bignumToBase64Url(key.n),
    e: hexToBase64Url(e),
  }
  return Object.assign(jwk, extras)
}

const decodeRsaPrivate = (buffer, extras) => {
  var key = RSAPrivateKey.decode(buffer, 'der')
  var e = pad(key.e.toString(16))
  var jwk = {
    kty: 'RSA',
    n: bignumToBase64Url(key.n),
    e: hexToBase64Url(e),
    d: bignumToBase64Url(key.d),
    p: bignumToBase64Url(key.p),
    q: bignumToBase64Url(key.q),
    dp: bignumToBase64Url(key.dp),
    dq: bignumToBase64Url(key.dq),
    qi: bignumToBase64Url(key.qi),
  }
  return Object.assign(jwk, extras)
}

const decodePrivate = (buffer, extras) => {
  var info = PrivateKeyInfo.decode(buffer, 'der')
  return decodeRsaPrivate(info.privateKey.data, extras)
}

const decodePublic = (buffer, extras) => {
  var info = PublicKeyInfo.decode(buffer, 'der')
  return decodeRsaPublic(info.publicKey.data, extras)
}

/** @param {string} header */
const getDecoder = header => {
  var match = /^-----BEGIN (RSA )?(PUBLIC|PRIVATE) KEY-----$/.exec(header)
  if (!match) {
    return null
  }
  var isRSA = !!match[1]
  var isPrivate = match[2] === 'PRIVATE'
  if (isPrivate) {
    return isRSA ? decodeRsaPrivate : decodePrivate
  }
  return isRSA ? decodeRsaPublic : decodePublic
}

/**
 * @param {import('crypto').KeyObject} pem
 * @param {*} extras
 * @returns {JsonWebKey}
 */
export const pemToJwk = (pem, extras) => {
  const onLine = /(\r\n|\r|\n)+/g
  const text = pem
    .toString()
    .split(onLine)
    .filter(line => line.trim().length)
  const decoder = getDecoder(text.at(0))
  const body = text.slice(1, -1).join('')
  const onErroneous = /[^\w\d\+\/=]+/g
  return decoder(Buffer.from(body.replace(onErroneous, ''), 'base64'), extras)
}
