import "dotenv/config";
import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";
import {
  GatewayDispatchEvents,
  GatewayIntentBits,
  Client,
  ChannelsAPI,
} from "@discordjs/core";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";

import { GetWorkplaceDistances } from "./distance.js";
import { GetLocalStores } from "./places.js";
import { GetDirections } from "./directions.js";

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
    content.includes("https://www.rightmove.co.uk") ||
    content.includes("https://www.zoopla.co.uk") ||
    content.includes("https://www.openrent.co.uk")
  ) {
    const location = getLocationFromPage(content);
    CreateMessage(location, message.data.channel_id === testInChannelID);
  } else if (
    (message.data.channel_id === testOutChannelID ||
      message.data.channel_id === botChannelID) &&
    !message.data.author.bot
  ) {
    CreateMessage(content, message.data.channel_id === testOutChannelID);
  } else if (
    message.data.channel_id === testManChannelID &&
    !message.data.author.bot
  ) {
    console.log("manual");
    RoutesTest(content);
  }
});

gateway.connect();

async function getLocationFromPage(url) {
  const res = await fetch(url);
  const html = await res.text();
  const dom = new JSDOM(html);
  const title = dom.window.document.title;
  let address;
  if (title.includes(" in ")) {
    address = title.split(" in ")[1];
  } else {
    address = title.split(", ").slice(1).join(", ");
  }

  if (address.includes(" - ")) {
    address = address.split(" - ")[0];
  }
  return address;
}

async function CreateMessage(address, test = false) {
  const distancesFromAddress = await GetWorkplaceDistances(address);
  const directions = await GetDirections(address);
  let response = "";
  response += `**${address}:**`;
  for (const [workPlace, time] of Object.entries(distancesFromAddress)) {
    response += "\n" + workPlace + " - " + time;
    if(workPlace !== "Computacenter") {
      response += " - " + directions[workPlace];
    }
    // response += "\n";
  }

  const closestStores = await GetLocalStores(address);
  response += "\n\nTop 5 supermarkets within 1km:\n";
  for (const store of closestStores) {
    response += store.name + " - " + store.distance + "\n";
  }
  if (test) {
    channels.createMessage(testOutChannelID, { content: response });
  } else {
    channels.createMessage(botChannelID, { content: response });
  }
}
