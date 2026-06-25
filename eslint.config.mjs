import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

// Ported from DockBloxx (next/core-web-vitals + next/typescript, plus the two
// warn rules — byte-faithful). eslint-config-next@16 ships these as native flat
// configs, so they're spread directly (FlatCompat is not used / not needed under
// Next 16 + ESLint 9). Ignores added for build output.
const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "coverage/**", "next-env.d.ts"] },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
