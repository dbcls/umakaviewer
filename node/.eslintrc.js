module.exports = {
  "parser": "@typescript-eslint/parser",
  "env": {
    "browser": true,
    "es6": true
  },
  "extends": [
    "airbnb",
    "plugin:prettier/recommended"
  ],
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 2018,
    "sourceType": "module",
    "project": "./tsconfig.json",
  },
  "plugins": [
    "@typescript-eslint",
    "react",
    "react-hooks"
  ],
  "settings": {
    "import/extensions": [".js", ".jsx", ".ts", ".tsx"],
    "import/resolver": {
      "node": {
        "extensions": [".js", ".jsx", ".ts", ".tsx"]
      },
      "webpack": {
        "config": "webpack.config.js"
      }
    }
  },
  "rules": {
    "react/prop-types": [0],
    'no-use-before-define': [0],
    '@typescript-eslint/no-use-before-define': [1],
    "react-hooks/rules-of-hooks": "error",
    "react/jsx-filename-extension": [
      "error",
      {
        "extensions": [".js", ".jsx", ".ts", ".tsx"]
      }
    ],
    "jsx-a11y/label-has-associated-control": [ "error", {
      "required": {
        "some": [ "nesting", "id"  ]
      }
    }],
    "jsx-a11y/label-has-for": [ "error", {
      "required": {
        "some": [ "nesting", "id"  ]
      }
    }],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "semi": ["error", "never", {"beforeStatementContinuationChars": "never"}],
    "semi-spacing": ["error", {"after": true, "before": false}],
    "semi-style": ["error", "first"],
    "no-extra-semi": "error",
    "no-unexpected-multiline": "error",
    "no-unreachable": "error",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        "js": "never",
        "jsx": "never",
        "ts": "never",
        "tsx": "never"
      }
   ],
   "no-shadow": "off",
   "@typescript-eslint/no-shadow": ["error"],
   "react/no-array-index-key": "off",
   "react/require-default-props": "off",
   "react/jsx-one-expression-per-line": "off",
   "react/jsx-props-no-spreading": "off",
   "import/no-cycle": "off",
   "jsx-a11y/control-has-associated-label": "off",
  }
};
