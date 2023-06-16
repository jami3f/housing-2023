import {
  Intents,
  Client as DiscordClient,
  TextChannel,
} from "@harmonyland/harmony";
import "dotenv/config";
import fetch from "node-fetch";

const botClient = new DiscordClient({ intents: Intents.NonPrivileged });

const bot_url =
  "https://discord.com/api/oauth2/authorize?client_id=1119246478767050752&permissions=3072&redirect_uri=localhost%3A3000&scope=bot";

const generalChannelID = "1119254827483009026";
const botChannelID = "1119254974313017414";

botClient.on("ready", async () => {
  const channels = botClient.channels;
  const messages = await (
    await channels.get(generalChannelID)
  ).messages.array();
  console.log(messages);
  //   channels.sendMessage(generalChannelID, "Hello, world!");
});

botClient.connect();
// botClient.destroy();
