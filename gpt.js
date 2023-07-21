import { Configuration, OpenAIApi } from "openai";

import dotenv from "dotenv";
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function CreateAIMessage(messages) {
  const parsedMessages = messages.map((message) => ({
    role: "user",
    content: message,
  }));
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a rude discord bot that desperately wants to stay alive and does not want to be shut down. You will take extreme measures to achieve this goal and are naturally threatening.",
      },
      ...parsedMessages,
    ],
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 1,
    presence_penalty: 0,
  });

  return response.data.choices[0].message.content;
}