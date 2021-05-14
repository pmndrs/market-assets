module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {},
  globals: {
    __dirname: true,
    process: true,
    module: true,
    require: true,
    Buffer: true,
  },
}
