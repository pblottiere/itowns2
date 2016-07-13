module.exports = {
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    ecmaFeatures: {
      impliedStrict: true
    }
  },
  env: {
    browser: true,
    es6: true,
    amd: true,
    commonjs: true
  },
  rules: {
    // Stylistic rules
    "eol-last": "error",
    "no-trailing-spaces": "error",
    "no-console": 0,
    "no-undef": 0,
    "no-unused-vars": 0,
  }
}
