import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,jsx}"], plugins: { js }, extends: ["eslint:recommended"], languageOptions: { globals: {globals.browser, BigInt: "readonly"} } },
  pluginReact.configs.flat.recommended,
]);
