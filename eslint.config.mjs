import globals from "globals";
import { defineConfig } from "eslint/config";
import html from "eslint-plugin-html";
import tseslint from "typescript-eslint";

export default defineConfig([
    {
        ignores: ["www/js/**", "www/lib/**"]
    },

    {
        files: ["www/**/*.html"],
        plugins: {
            html
        }
    },

    {
        files: ["www/ts/**/*.ts"],

        extends: [
            ...tseslint.configs.recommended
        ],

        languageOptions: {
            parser: tseslint.parser,

            parserOptions: {
                projectService: true,
            },

            globals: globals.browser
        },

        rules: {
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/no-misused-promises": "error",
        }
    }
]);