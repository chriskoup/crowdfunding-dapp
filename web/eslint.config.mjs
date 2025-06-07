import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        BigInt: "readonly"
      }
    },
    plugins: {
      js
    },
    extends: ["eslint:recommended"],
  },
  pluginReact.configs.flat.recommended
]);
