import pkg from './package.json'

const input = './src/index.js'

// eslint-disable-next-line import/no-default-export
export default {
  input,
  external: ['crypto', '@panva/asn1.js', '@via-org/data-utils'],
  output: [
    { file: pkg.main, format: 'cjs' },
    { file: pkg.module, format: 'esm' },
  ],
}
