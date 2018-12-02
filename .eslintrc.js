module.exports = {
	"extends": "eslint:recommended",
	"root": true,
	"overrides": [{
		"files": ["src/**/*.js"],
		"env": {
			"browser": true,
			"commonjs": true,
			"es6": true,
		},
		"plugins": [
			"compat"
		],
		"globals": {
			/* define globals, disallow assignment */
			"DEBUG": false,
			"GIT_REV": false,
			"GA_ENABLED": false,
			"Modernizr": false,
			"_": false,
		},
		"settings": {
			"polyfills": [
				"promises"
			]
		},
		"rules": {
			"compat/compat": "warn",
			"no-cond-assign": "off",
			"no-console": "off",
			"no-empty": "warn",
			"no-fallthrough": "off", //* allow fallthrough in switch */
			"no-delete-var": "warn",
			"no-unused-vars": ["warn", { "args": "none" }],
			"no-useless-escape": "off", //"warn"
			"no-mixed-spaces-and-tabs": "warn",
		}
	}, {
		"files": [
			"gruntfile.js"
		],
		"env": {
			"node": true,
			"es6": true
		},

	}],
	"rules": {
		"no-cond-assign": "off",
		"no-console": "off",
		"no-empty": "warn",
		"no-fallthrough": "off", // allow fallthrough in switch
		"no-delete-var": "warn",
		"no-unused-vars": ["warn", { "args": "none" }],
		"no-useless-escape": "off",
		/*
		"accessor-pairs": "error",
		"array-bracket-newline": "off",
		"array-bracket-spacing": "off",
		"array-callback-return": "error",
		"array-element-newline": "off",
		"arrow-body-style": "error",
		"arrow-parens": "error",
		"arrow-spacing": "error",
		"block-scoped-var": "off",
		"block-spacing": "off",
		"brace-style": "off",
		"callback-return": "error",
		"camelcase": "off",
		"capitalized-comments": "off",
		"class-methods-use-this": "error",
		"comma-dangle": "off",
		"comma-spacing": "off",
		"comma-style": [
		"error",
			"last"
		],
		"complexity": "off",
		"computed-property-spacing": [
			"error",
			"never"
		],
		"consistent-return": "off",
		"consistent-this": "off",
		"curly": "off",
		"default-case": "off",
		"dot-location": [
			"error",
			"property"
		],
		"dot-notation": "off",
		"eol-last": "off",
		"eqeqeq": "off",
		"for-direction": "error",
		"func-call-spacing": "error",
		"func-name-matching": "error",
		"func-names": [
			"error",
			"never"
		],
		"func-style": "off",
		"function-paren-newline": "off",
		"generator-star-spacing": "error",
		"getter-return": "error",
		"global-require": "off",
		"guard-for-in": "off",
		"handle-callback-err": "error",
		"id-blacklist": "error",
		"id-length": "off",
		"id-match": "error",
		"implicit-arrow-linebreak": "error",
		"indent": "off",
		"indent-legacy": "off",
		"init-declarations": "off",
		"jsx-quotes": "error",
		"key-spacing": "off",
		"keyword-spacing": "off",
		"line-comment-position": "off",
		"linebreak-style": [
			"error",
			"unix"
		],
		"lines-around-comment": "off",
		"lines-around-directive": "off",
		"lines-between-class-members": "error",
		"max-depth": "off",
		"max-len": "off",
		"max-lines": "off",
		"max-nested-callbacks": "error",
		"max-params": "off",
		"max-statements": "off",
		"max-statements-per-line": "off",
		"multiline-comment-style": "off",
		"multiline-ternary": "off",
		"new-parens": "error",
		"newline-after-var": "off",
		"newline-before-return": "off",
		"newline-per-chained-call": "off",
		"no-alert": "error",
		"no-array-constructor": "error",
		"no-await-in-loop": "error",
		"no-bitwise": "off",
		"no-buffer-constructor": "error",
		"no-caller": "error",
		"no-catch-shadow": "error",
		"no-confusing-arrow": "error",
		"no-continue": "off",
		"no-div-regex": "error",
		"no-duplicate-imports": "error",
		"no-else-return": "off",
		"no-empty-function": "off",
		"no-eq-null": "error",
		"no-eval": "error",
		"no-extend-native": "error",
		"no-extra-bind": "off",
		"no-extra-label": "error",
		"no-extra-parens": "off",
		"no-floating-decimal": "error",
		"no-implicit-globals": "off",
		"no-implied-eval": "error",
		"no-inline-comments": "off",
		"no-inner-declarations": [
			"error",
			"functions"
		],
		"no-invalid-this": "error",
		"no-iterator": "error",
		"no-label-var": "error",
		"no-labels": "error",
		"no-lone-blocks": "off",
		"no-lonely-if": "off",
		"no-loop-func": "error",
		"no-magic-numbers": "off",
		"no-mixed-operators": "off",
		"no-mixed-requires": "error",
		"no-multi-assign": "off",
		"no-multi-spaces": "off",
		"no-multi-str": "error",
		"no-multiple-empty-lines": "error",
		"no-native-reassign": "error",
		"no-negated-condition": "off",
		"no-negated-in-lhs": "error",
		"no-nested-ternary": "off",
		"no-new": "off",
		"no-new-func": "error",
		"no-new-object": "error",
		"no-new-require": "error",
		"no-new-wrappers": "error",
		"no-octal-escape": "error",
		"no-param-reassign": "off",
		"no-path-concat": "error",
		"no-plusplus": "off",
		"no-process-env": "error",
		"no-process-exit": "error",
		"no-proto": "error",
		"no-prototype-builtins": "off",
		"no-restricted-globals": "error",
		"no-restricted-imports": "error",
		"no-restricted-modules": "error",
		"no-restricted-properties": "error",
		"no-restricted-syntax": "error",
		"no-return-assign": [
			"error",
			"except-parens"
		],
		"no-return-await": "error",
		"no-script-url": "error",
		"no-self-compare": "error",
		"no-sequences": "off",
		"no-shadow": "off",
		"no-shadow-restricted-names": "error",
		"no-spaced-func": "error",
		"no-sync": "error",
		"no-tabs": "off",
		"no-template-curly-in-string": "error",
		"no-ternary": "off",
		"no-throw-literal": "error",
		"no-trailing-spaces": "off",
		"no-undef-init": "error",
		"no-undefined": "off",
		"no-underscore-dangle": "off",
		"no-unmodified-loop-condition": "error",
		"no-unneeded-ternary": [
			"error",
			{
				"defaultAssignment": true
			}
		],
		"no-unused-expressions": "off",
		"no-use-before-define": "off",
		"no-useless-call": "off",
		"no-useless-computed-key": "error",
		"no-useless-concat": "error",
		"no-useless-constructor": "error",
		"no-useless-rename": "error",
		"no-useless-return": "off",
		"no-var": "off",
		"no-void": "off",
		"no-warning-comments": "off",
		"no-whitespace-before-property": "error",
		"no-with": "error",
		"nonblock-statement-body-position": [
			"error",
			"any"
		],
		"object-curly-newline": "off",
		"object-curly-spacing": "off",
		"object-shorthand": "off",
		"one-var": "off",
		"one-var-declaration-per-line": "off",
		"operator-assignment": "off",
		"operator-linebreak": [
			"error",
			"after"
		],
		"padded-blocks": "off",
		"padding-line-between-statements": "error",
		"prefer-arrow-callback": "off",
		"prefer-const": "error",
		"prefer-destructuring": "off",
		"prefer-numeric-literals": "error",
		"prefer-promise-reject-errors": "error",
		"prefer-reflect": "off",
		"prefer-rest-params": "off",
		"prefer-spread": "off",
		"prefer-template": "off",
		"quote-props": "off",
		"quotes": "off",
		"radix": "off",
		"require-await": "error",
		"require-jsdoc": "off",
		"rest-spread-spacing": "error",
		"semi": "off",
		"semi-spacing": "off",
		"semi-style": "off",
		"sort-imports": "error",
		"sort-keys": "off",
		"sort-vars": "off",
		"space-before-blocks": "off",
		"space-before-function-paren": "off",
		"space-in-parens": "off",
		"space-infix-ops": "off",
		"space-unary-ops": [
			"error",
			{
				"nonwords": false,
				"words": false
			}
		],
		"spaced-comment": "off",
		"strict": "off",
		"switch-colon-spacing": "error",
		"symbol-description": "error",
		"template-curly-spacing": "error",
		"template-tag-spacing": "error",
		"unicode-bom": [
			"error",
			"never"
		],
		"valid-jsdoc": "off",
		"vars-on-top": "off",
		"wrap-iife": [
			"error",
			"any"
		],
		"wrap-regex": "off",
		"yield-star-spacing": "error"
		*/
	}
};
