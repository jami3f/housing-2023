import {
  Client,
  PlacesNearbyRanking,
} from "@googlemaps/google-maps-services-js";
import "dotenv/config";

import { GetDistanceToStore } from "./distance.js";

const mapClient = new Client({});

export async function GetLocalStores(placeName) {
  const geoCoded = await mapClient.geocode({
    params: {
      address: placeName,
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  });
  if (geoCoded.data.status !== "OK") {
    return { Computacenter: "Error", Hutch: "Error", NaturalMotion: "Error" };
  }
  const latLong = geoCoded.data.results[0].geometry.location;
  const storesNearby = await mapClient.placesNearby({
    params: {
      location: latLong,
      keyword: "supermarket",
      key: process.env.GOOGLE_MAPS_API_KEY,
      rankby: PlacesNearbyRanking.prominence,
      radius: 1000,
    },
    timeout: 1000,
  });
  let distancesToStores;

  distancesToStores = await Promise.all(
    storesNearby.data.results
      .map(async (store) => ({
        name: store.name,
        distance: await GetDistanceToStore(latLong, store.geometry.location),
      }))
      .slice(0, 5)
  );

  return distancesToStores;
}
