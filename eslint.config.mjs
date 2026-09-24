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
      globals: globals.browser
    }
  }
]);