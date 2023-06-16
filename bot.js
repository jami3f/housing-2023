import "dotenv/config";
import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";
import {
  GatewayDispatchEvents,
  GatewayIntentBits,
  InteractionType,
  MessageFlags,
  Client,
  ChannelsAPI,
} from "@discordjs/core";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import { GetWorkplaceDistances } from "./distance.js";
import { GetLocalStores } from "./places.js";

const token = process.env.DISCORD_TOKEN;

const rest = new REST({ version: "10" }).setToken(token);

const gateway = new WebSocketManager({
  token,
  intents: GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent,
  rest,
});

const client = new Client({ rest, gateway });
const channels = new ChannelsAPI(rest);

const generalChannelID = "1119254827483009026";
const botChannelID = "1119254974313017414";

// client.once(GatewayDispatchEvents.Ready, async () => {
//   const messageObjects = await channels.getMessages(generalChannelID);
//   const messages = messageObjects
//     .map((message) => message.content)
//     .filter((message) => message.startsWith("https"));

//   for (const message of messages) {
//     await CreateMessage(message);
//   }
// //   gateway.destroy();
// });

client.on(GatewayDispatchEvents.MessageCreate, async (message) => {
    const content = message.data.content;
  if (!content.startsWith("https") || message.channelId === botChannelID) return;
  CreateMessage(content);
});

gateway.connect();

async function CreateMessage(message) {
  const res = await fetch(message);
  const html = await res.text();
  const dom = new JSDOM(html);

  const address = dom.window.document.title.split("rent in ")[1];

  const distancesFromAddress = await GetWorkplaceDistances(address);
  let response = "";
  response += `**Distances from ${address}:**\n`;
  for (const [workPlace, time] of Object.entries(distancesFromAddress)) {
    response += workPlace + " - " + time + "\n";
  }

  const closestStores = await GetLocalStores(address);
  response += "\nTop 5 supermarkets within 1km:\n";
  for (const store of closestStores) {
    response += store.name + " - " + store.distance + "\n";
  }

  channels.createMessage(botChannelID, { content: response });
}
