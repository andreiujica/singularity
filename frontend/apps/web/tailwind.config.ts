import type { Config } from "tailwindcss"
import typographyPlugin from '@tailwindcss/typography';

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  plugins: [typographyPlugin],
};

export default config; 