// @ts-check

import eslint from "@eslint/js"
import tseslint from "typescript-eslint"

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.stylisticTypeChecked,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json", "../../tsconfig.json"],
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  {
    ignores: ["**/dist", "**/node_modules", "**/coverage", "**/eslint.config.mjs"]
  }
)
