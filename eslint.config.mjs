// ESLint 9 (flat config). Uso: npm run lint   (npm run lint:fix aplica os ajustes automáticos)
import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["node_modules/**", ".cache/**", "test-results/**", "playwright-report/**", "_site/**", "data/**", "docs/**"] },
  js.configs.recommended,
  {
    rules: {
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-unused-vars": ["error", { args: "none", caughtErrors: "none" }],
      "no-empty": ["error", { allowEmptyCatch: true }], // `try { localStorage... } catch (e) {}` é intencional
    },
  },
  {
    // o site: módulos ES no navegador
    files: ["assets/**/*.js"],
    languageOptions: { sourceType: "module", globals: globals.browser },
  },
  {
    // ferramentas e testes: Node
    files: ["scripts/**/*.mjs", "tests/**/*.mjs", "*.mjs"],
    languageOptions: { sourceType: "module", globals: { ...globals.node, ...globals.browser } },
  },
];
