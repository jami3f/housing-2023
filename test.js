import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import { GetWorkplaceDistances } from "./distance.js";
import { GetLocalStores } from "./places.js";
function test(content) {
  if (
    !content.includes("https://www.rightmove.co.uk") &&
    !content.includes("https://www.openrent.co.uk") &&
    !content.includes("https://www.zoopla.co.uk")
  )
    return console.log("Didn't work");
  CreateMessage(content);
}

async function CreateMessage(message) {
  const res = await fetch(message);
  const html = await res.text();
  const dom = new JSDOM(html);
  const title = dom.window.document.title;
  console.log(title)
  let address;
  if (title.includes(" in ")) {
    address = title.split(" in ")[1];
  } else {
    address = title.split(", ")[1];
  }

  if (address.includes(" - ")) {
    address = address.split(" - ")[0];
  }

  //     const distancesFromAddress = await GetWorkplaceDistances(address);
  //     let response = "";
  //     response += `**${address}:**\n`;
  //     for (const [workPlace, time] of Object.entries(distancesFromAddress)) {
  //       response += workPlace + " - " + time + "\n";
  //     }

  //     const closestStores = await GetLocalStores(address);
  //     response += "\nTop 5 supermarkets within 1km:\n";
  //     for (const store of closestStores) {
  //       response += store.name + " - " + store.distance + "\n";
  //     }

  //   console.log("res" + response);
}
(async () => {
  await test("https://www.zoopla.co.uk/to-rent/details/64908595/");
  await test("https://www.rightmove.co.uk/properties/136681031#/?channel=RES_LET");
  await test(
    "https://www.openrent.co.uk/property-to-rent/london/4-bed-flat-ballards-lane-n3/1691751"
  );
})();
