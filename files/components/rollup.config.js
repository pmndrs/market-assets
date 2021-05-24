import path from 'path'
import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import glslify from 'rollup-plugin-glslify'
import multiInput from 'rollup-plugin-multi-input'
import { terser } from 'rollup-plugin-terser'
import images from 'rollup-plugin-image-files'
import copy from 'rollup-plugin-copy'

const root = process.platform === 'win32' ? path.resolve('/') : '/'
const external = (id) => !id.startsWith('.') && !id.startsWith(root)
const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json']

const getBabelOptions = ({ useESModules }, targets) => ({
  babelrc: false,
  extensions,
  exclude: '**/node_modules/**',
  babelHelpers: 'runtime',
  presets: [
    ['@babel/preset-env', { loose: true, modules: false, targets }],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-proposal-nullish-coalescing-operator',
    ['@babel/transform-runtime', { regenerator: false, useESModules }],
  ],
})

const plugins = [
  json(),
  images(),
  glslify(),
  copy({
    targets: [
      {
        src: 'src/water/*.jpeg',
        dest: 'dist/water/',
      },
    ],
  }),
]

export default [
  {
    input: ['src/**/*.js', 'src/**/*.ts', 'src/**/*.tsx', '!src/index.js'],
    output: { dir: `dist`, format: 'esm' },
    external,
    plugins: [
      multiInput(),
      ...plugins,
      babel(
        getBabelOptions(
          { useESModules: true },
          '>1%, not dead, not ie 11, not op_mini all'
        )
      ),
      resolve({ extensions }),
    ],
  },
  {
    input: `./src/index.js`,
    output: { dir: `dist`, format: 'esm' },
    external,
    plugins: [
      ...plugins,
      babel(
        getBabelOptions(
          { useESModules: true },
          '>1%, not dead, not ie 11, not op_mini all'
        )
      ),
      resolve({ extensions }),
    ],
    preserveModules: true,
  },
  {
    input: ['src/**/*.js', 'src/**/*.ts', 'src/**/*.tsx', '!src/index.js'],
    output: { dir: `dist`, format: 'cjs' },
    external,
    plugins: [
      ...plugins,
      multiInput({
        transformOutputPath: (output) => output.replace(/\.[^/.]+$/, '.cjs.js'),
      }),

      babel(getBabelOptions({ useESModules: false })),
      resolve({ extensions }),
      terser(),
    ],
  },
  {
    input: `./src/index.js`,
    output: { file: `dist/index.cjs.js`, format: 'cjs' },
    external,
    plugins: [
      json(),
      images(),
      glslify(),
      babel(getBabelOptions({ useESModules: false })),
      resolve({ extensions }),
      terser(),
    ],
  },
]
