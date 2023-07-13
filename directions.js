import {
  Client as MapClient,
  TravelMode,
} from "@googlemaps/google-maps-services-js";
import "dotenv/config";

export async function GetDirections(placeName) {
  const mapClient = new MapClient({});
  const geoCoded = await mapClient.geocode({
    params: {
      address: placeName,
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  });
  if (geoCoded.data.status !== "OK") {
    return [{ name: "Error", distance: "Could not find location" }];
  }
  const latLong = geoCoded.data.results[0].geometry.location;

  const workplaces = [
    // { name: "Computacenter", address: "Computacenter UK Ltd, Hatfield, UK" },
    { name: "NaturalMotion", address: "Natural Motion, London, UK" },
    { name: "Hutch", address: "Hutch Games, London, UK" },
  ];

  const result = {};

  for (const workplace of workplaces) {
    console.log(workplace);
    const destinationGeoCoded = await mapClient.geocode({
      params: {
        address: workplace.address,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    const destinationLatLong =
      destinationGeoCoded.data.results[0].geometry.location;

    const directions = await mapClient.directions({
      params: {
        origin: latLong,
        destination: destinationLatLong,
        key: process.env.GOOGLE_MAPS_API_KEY,
        mode: TravelMode.transit,
      },
    });
    const routes = directions.data.routes;
    if(routes.length === 0) {
      result[workplace.name] = "No routes found";
      continue;
    }
    const steps = routes[0].legs[0].steps
      .map(
        (step) =>
          `${step.html_instructions.split(" ")[0]} ${step.duration.text}`
      )
      .join(" > ");

    result[workplace.name] = steps;
  }
  return result;
}
