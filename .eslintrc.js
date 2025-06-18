module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended", // Enables eslint-plugin-prettier and displays Prettier errors as ESLint errors.
    "prettier", // Disables ESLint rules that conflict with Prettier
  ],
  plugins: ["prettier"],
  rules: {
    // Example custom rules
    "prettier/prettier": "error",
    "no-unused-vars": "warn",
    "no-console": "off",
  },
  ignorePatterns: ["dist/", "node_modules/"],
};
