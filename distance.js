import { Client, TravelMode } from "@googlemaps/google-maps-services-js";
import "dotenv/config";

const mapClient = new Client({});

export async function GetWorkplaceDistances(placeName) {
  const distanceToHatfield = await mapClient.distancematrix({
    params: {
      origins: [placeName],
      destinations: ["Computacenter UK Ltd, Hatfield, UK"],
      mode: TravelMode.driving,
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
    timeout: 1000,
  });

  const distanceToHutch = await mapClient.distancematrix({
    params: {
      origins: [placeName],
      destinations: ["Hutch Games, London, UK"],
      mode: TravelMode.transit,
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
    timeout: 1000,
  });

  const distanceToNM = await mapClient.distancematrix({
    params: {
      origins: [placeName],
      destinations: ["Natural Motion, London, UK"],
      mode: TravelMode.transit,
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
    timeout: 1000,
  });
  try {
    return {
      Computacenter: distanceToHatfield.data.rows[0].elements[0].duration.text,
      Hutch: distanceToHutch.data.rows[0].elements[0].duration.text,
      NaturalMotion: distanceToNM.data.rows[0].elements[0].duration.text,
    };
  } catch (e) {
    console.log(e);
    return {
      Computacenter: "Error",
      Hutch: "Error",
      NaturalMotion: "Error",
    };
  }
}

export async function GetDistanceToStore(house, store) {
  const response = await mapClient.distancematrix({
    params: {
      origins: [house],
      destinations: [store],
      mode: TravelMode.walking,
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
    timeout: 1000,
  });
  const distance = response.data.rows[0].elements[0].duration.text;
  return distance;
}
