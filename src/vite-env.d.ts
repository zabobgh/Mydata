declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The API key for the Google Gemini service.
     * This is injected at build time by Vite.
     */
    API_KEY: string;
  }
}
