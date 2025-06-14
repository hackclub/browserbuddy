import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginSvelte from "eslint-plugin-svelte";
import globals from "globals";
import svelteParser from "svelte-eslint-parser";
import tsEslint from "typescript-eslint";
import tailwindcss from "eslint-plugin-tailwindcss"

export default tsEslint.config(
    js.configs.recommended,
    ...tsEslint.configs.recommended,
    ...eslintPluginSvelte.configs["flat/recommended"],
    eslintConfigPrettier,
    ...eslintPluginSvelte.configs["flat/prettier"],
    ...tailwindcss.configs["flat/recommended"],
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: { ...globals.node, ...globals.browser },
            parser: svelteParser,
            parserOptions: {
                parser: tsEslint.parser,
                extraFileExtensions: [".svelte"],
            },
        },
    },
    {
        ignores: [
            "**/.svelte-kit",
            "**/.vercel",
            "**/.yarn",
            "**/build",
            "**/node_modules",
            "**/package",
            "**/.output",
            "**/.wxt",
        ],
    },
);