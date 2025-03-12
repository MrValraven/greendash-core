const path = require("path");

/** @type {import('eslint').Linter.Config} */
const config = {
  overrides: [
    {
      files: ["*.cjs", "*.js"],
      parserOptions: {
        ecmaVersion: "latest",
      },
      rules: {},
    },
    {
      files: ["*.mjs"],
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      rules: {},
    },
    {
      files: ["*.ts", "*.tsx"],
      parserOptions: {
        project: path.join(__dirname, "tsconfig.json"),
        tsconfigRootDir: __dirname,
      },
      settings: {
        react: {
          version: "detect",
        },
      },
      parser: "@typescript-eslint/parser",
      plugins: [
        "@typescript-eslint",
        "tailwindcss",
        "eslint-plugin-react",
        "import",
        "jsx-a11y",
      ],
      extends: [
        "next/core-web-vitals",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:tailwindcss/recommended",
        "plugin:react/recommended",
      ],
      rules: {
        "@typescript-eslint/consistent-type-imports": [
          "error",
          {
            prefer: "type-imports",
            fixStyle: "inline-type-imports",
          },
        ],
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            argsIgnorePattern: "^_",
            vars: "all",
            args: "all",
            varsIgnorePattern: "^_",
          },
        ],
        "no-unused-vars": "off",
        "no-dupe-else-if": "error",
        "no-dupe-keys": "error",
        "no-duplicate-imports": "error",
        "no-unreachable": "error",
        "no-use-before-define": "error",
        "dot-notation": "error",
        eqeqeq: "error",
        "no-lonely-if": "error",
        "no-return-await": "error",
        "no-useless-catch": "error",
        "no-var": "error",
        "prefer-const": "error",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/consistent-type-definitions": ["warn", "type"],
        "consistent-return": "error",
        "@typescript-eslint/explicit-function-return-type": [
          "warn",
          {
            allowExpressions: true,
            allowTypedFunctionExpressions: true,
          },
        ],
        "object-shorthand": "error",
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/return-await": "error",
        "no-unneeded-ternary": "error",
        "no-restricted-imports": [
          "error",
          {
            patterns: ["../"],
          },
        ],
        "import/no-default-export": "error",
        "@typescript-eslint/no-confusing-void-expression": "error",
        "@typescript-eslint/no-meaningless-void-operator": "warn",
        "react/function-component-definition": [
          "error",
          {
            namedComponents: ["arrow-function"],
            unnamedComponents: "arrow-function",
          },
        ],
        "no-plusplus": [
          "error",
          {
            allowForLoopAfterthoughts: true,
          },
        ],
        "@typescript-eslint/strict-boolean-expressions": [
          "error",
          {
            allowString: false,
            allowNumber: false,
            allowNullableObject: false,
          },
        ],
        "no-implicit-coercion": "error",
        "jsx-a11y/label-has-associated-control": [
          "error",
          {
            labelComponents: ["Label"],
            labelAttributes: ["label"],
            controlComponents: ["Input", "Select"],
            depth: 2,
            required: {
              some: ["nesting", "id"],
            },
          },
        ],
        "jsx-a11y/anchor-is-valid": [
          "error",
          {
            components: ["Link"],
            specialLink: ["hrefLeft", "hrefRight"],
            aspects: ["invalidHref", "preferButton"],
          },
        ],
        "@typescript-eslint/prefer-nullish-coalescing": "error",
        "@typescript-eslint/no-unnecessary-condition": "error",
        "@typescript-eslint/no-unsafe-assignment": "error",
        "@typescript-eslint/no-unsafe-member-access": "error",
        "@typescript-eslint/no-unsafe-call": "error",
        "@typescript-eslint/no-unsafe-return": "error",
        "@typescript-eslint/no-non-null-assertion": "error",
        "@typescript-eslint/prefer-optional-chain": "error",
        "@typescript-eslint/no-unnecessary-type-assertion": "error",

        // React
        "react/prop-types": "off",
        "react/jsx-key": "error",
        "react/jsx-no-target-blank": "error",
        "react/jsx-no-useless-fragment": "warn",
        "react/no-array-index-key": "warn",
        "react/no-deprecated": "warn",
        "react/no-unused-state": "error",
        "react/button-has-type": "error",
        "react/display-name": "error",
        "react/hook-use-state": "error",
        "react/jsx-fragments": ["error", "element"],
        "react/no-children-prop": "off",
        "react/react-in-jsx-scope": "off",
        "react/jsx-curly-brace-presence": "error",
        "react/jsx-boolean-value": "error",
        "react/no-direct-mutation-state": "error",
        "react/self-closing-comp": "error",
        "react/no-unknown-property": "error",
      },
    },
    {
      files: ["{page,layout,not-found}.tsx"],
      rules: {
        "import/no-default-export": "off",
      },
    },
  ],
};

module.exports = config;