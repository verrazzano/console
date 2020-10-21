// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    mocha: true,
    amd: true
  },
  extends: [
    'standard',
    'prettier',
    'plugin:css-modules/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint',
    'css-modules',
    'html'
  ],
  rules: {
  },
  settings: {
    'css-modules': {
      basePath: "src/css"
    }
  }
}
