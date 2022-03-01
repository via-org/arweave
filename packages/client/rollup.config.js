import resolve from '@rollup/plugin-node-resolve'
import pkg from './package.json'

const inputs = {
  main: './src/index.js',
  utilities: './src/utilities.js',
}

// eslint-disable-next-line import/no-default-export
export default [
  /**
   * Primary export, i.e. @via-org/arweave-client
   */
  {
    /** Browser */
    input: inputs.main,
    external: ['cross-fetch'],
    output: {
      name: 'Arweave',
      file: pkg.exports['.'].browser,
      format: 'iife',
      globals: {
        'cross-fetch': 'window.fetch',
      },
      // NOTE: removing interop for cross-fetch fixes the `TypeError:
      // 'fetch' called on an object that does not implement interface
      // Window.` error
      interop: id => id !== 'cross-fetch',
    },
    plugins: [resolve({ preferBuiltins: false, browser: true })],
  },
  {
    /** ESM + CJS */
    input: inputs.main,
    external: [...Object.keys(pkg.dependencies)],
    output: [
      { file: pkg.exports['.'].import, format: 'esm' },
      { file: pkg.exports['.'].require, format: 'cjs' },
    ],
  },

  /**
   * Uilities export, i.e. @via-org/arweave-client/utilities
   */
  {
    /** Browser */
    input: inputs.utilities,
    output: {
      name: 'Utilities',
      file: pkg.exports['./utilities'].browser,
      format: 'iife',
    },
    plugins: [resolve({ preferBuiltins: false, browser: true })],
  },
  {
    /** ESM + CJS */
    input: inputs.utilities,
    external: [...Object.keys(pkg.dependencies), 'url'],
    output: [
      { file: pkg.exports['./utilities'].import, format: 'esm' },
      { file: pkg.exports['./utilities'].require, format: 'cjs' },
    ],
  },
]
