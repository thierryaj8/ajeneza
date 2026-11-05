declare module "@tailwindcss/typography" {
  import type { Config } from "tailwindcss";

  const typography: NonNullable<Config["plugins"]>[number];
  export default typography;
}
