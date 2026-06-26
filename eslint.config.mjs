import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

// Ported from DockBloxx (next/core-web-vitals + next/typescript + the two warn
// rules). eslint-config-next@16 ships native flat configs, so they're spread
// directly (FlatCompat is not needed under Next 16 + ESLint 9).
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "next-env.d.ts",
      "agent_docs/**", // factory docs / templates — not app source
    ],
  },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // DockBloxx had bare "warn". The arg/varsIgnorePattern "^_" is added on top
      // so intentionally-unused, underscore-marked names stay clean — notably the
      // frozen Phase-7 service params (_storeId, _file) whose signatures must NOT
      // change. (This is the one principled divergence from bare DockBloxx.)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      // Downgraded from the next preset's ERROR to warn: several hits are valid
      // data-loading useEffect patterns (incl. the known Navbar fetchUser one).
      // Flagged for later review — NOT blindly rewritten in a lint pass.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;
