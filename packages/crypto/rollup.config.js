import pkg from './package.json'

const input = './src/index.js'

// eslint-disable-next-line import/no-default-export
export default {
  input,
  externals: [
    '@via-org/arweave-node-crypto',
    '@via-org/arweave-browser-crypto',
  ],
  output: [
    { file: pkg.exports['.'].require, format: 'cjs' },
    { file: pkg.exports['.'].import, format: 'esm' },
  ],
}
