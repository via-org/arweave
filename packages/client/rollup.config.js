import pkg from './package.json'

const input = './src/index.js'

// eslint-disable-next-line import/no-default-export
export default {
  input,
  output: [
    { file: pkg.main, format: 'cjs' },
    { file: pkg.module, format: 'esm' },
  ],
}
