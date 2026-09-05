import { geocoding } from "@maptiler/client";

export async function searchPlace(query) {
  const result = await geocoding.forward(query);
  console.log(result);
  return result;
}
