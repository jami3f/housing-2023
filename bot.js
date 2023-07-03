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

const generalChannelID = "1115943750838009866";
const botChannelID = "1119373027289862227";
const testInChannelID = "1119254827483009026";
const testOutChannelID = "1119254974313017414";

client.on(GatewayDispatchEvents.MessageCreate, async (message) => {
  const content = message.data.content;
  if (
    (!content.includes("https://www.rightmove.co.uk") &&
      !content.includes("https://www.zoopla.co.uk") &&
      !content.includes("https://openrent.co.uk")) ||
    message.channelId === botChannelID
  )
    return;
  CreateMessage(content, message.channelId === testInChannelID);
});

gateway.connect();

async function CreateMessage(message, test = false) {
  const res = await fetch(message);
  const html = await res.text();
  const dom = new JSDOM(html);
  const title = dom.window.document.title;
  console.log(title);
  let address;
  if (title.includes(" in ")) {
    address = title.split(" in ")[1];
  } else {
    address = title.split(", ")[1];
  }

  if (address.includes(" - ")) {
    address = address.split(" - ")[0];
  }
  const distancesFromAddress = await GetWorkplaceDistances(address);
  let response = "";
  response += `**${address}:**\n`;
  for (const [workPlace, time] of Object.entries(distancesFromAddress)) {
    response += workPlace + " - " + time + "\n";
  }

  const closestStores = await GetLocalStores(address);
  response += "\nTop 5 supermarkets within 1km:\n";
  for (const store of closestStores) {
    response += store.name + " - " + store.distance + "\n";
  }
  if (test) {
    channels.createMessage(testOutChannelID, { content: response });
  } else {
    channels.createMessage(botChannelID, { content: response });
  }
}
