import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "thunAi", // Unique app ID
  name: "thunAi",
  credentials: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
    },
  },
});
