import "dotenv/config";
import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";
import {
  GatewayDispatchEvents,
  GatewayIntentBits,
  Client,
  ChannelsAPI,
} from "@discordjs/core";
import { readFileSync, write, writeFileSync } from "fs";
import CreateAIMessage from "./gpt.js";

const token = process.env.DISCORD_TOKEN;

const rest = new REST({ version: "10" }).setToken(token);

const gateway = new WebSocketManager({
  token,
  intents: GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent,
  rest,
});

const client = new Client({ rest, gateway });
const channels = new ChannelsAPI(rest);

// const generalChannelID = "1115943750838009866";
const botChannelID = "1119373027289862227";
const testInChannelID = "1119254827483009026";
const testOutChannelID = "1119254974313017414";
const testManChannelID = "1119254974313017414";

client.on(GatewayDispatchEvents.MessageCreate, (message) => {
  const content = message.data.content;
  if (
    (message.data.channel_id === testOutChannelID ||
      message.data.channel_id === botChannelID) &&
    !message.data.author.bot
  ) {
    CreateMessage(content, message.data.channel_id);
  }
});

gateway.connect();

async function CreateMessage(content, channelID) {
  writeFileSync("messages.txt", `\n${content}`, { flag: "a" });
  const messages = readFileSync("messages.txt", "utf8").split("\n").filter((message) => message !== "");
  const response = await CreateAIMessage(messages);
  await channels.createMessage(channelID, {content: response});
  writeFileSync("messages.txt", `\n${response}`, { flag: "a" });
}

CreateMessage("hello", testOutChannelID);
