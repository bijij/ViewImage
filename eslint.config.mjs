import json from "eslint-plugin-json";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["node_modules/*", "**/eslint.config.mjs"],
}, ...compat.extends("eslint:recommended"), {
    plugins: {
        json,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            chrome: false,
            browser: false,
        },

        ecmaVersion: 2020,
        sourceType: "module",
    },

    rules: {
        "no-global-assign": ["error"],

        indent: ["error", 4, {
            SwitchCase: 1,
        }],

        "linebreak-style": "off",
        quotes: ["error", "single"],
        semi: ["error", "always"],
        "eol-last": "error",
    },
}];