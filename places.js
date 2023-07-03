import {
  Client,
  PlacesNearbyRanking,
  TravelMode,
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
  try {
    distancesToStores = await Promise.all(
      storesNearby.data.results
        .map(async (store) => ({
          name: store.name,
          distance: await GetDistanceToStore(latLong, store.geometry.location),
        }))
        .slice(0, 5)
    );
  } catch (e) {
    console.log(e);
    return {
      Computacenter: "Error",
      Hutch: "Error",
      NaturalMotion: "Error",
    };
  }

  return distancesToStores;
}
