// eslint.config.js
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

export default [
	js.configs.recommended,
	eslintConfigPrettier,
	{
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "module",
			globals: {
				...globals.browser,
				chrome: "readonly",
			},
		},
		rules: {},
		ignores: [".github/"],
	},
];
