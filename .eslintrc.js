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
    "no-trailing-spaces": 0,
    "no-redeclare": 0,
    "eol-last": 0,
    "comma-dangle": 0,
    "no-mixed-spaces-and-tabs": 0,
    "no-extra-semi": 0,
    "no-constant-condition": 0,
    "no-dupe-keys": 0,
    "no-empty": 0,
  }
}
