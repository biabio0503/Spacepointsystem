import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextVitals,
  {
    ignores: [".next/**", "node_modules/**", "lib/generated/**"],
    rules: {
      "@next/next/no-img-element": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
];

export default eslintConfig;
