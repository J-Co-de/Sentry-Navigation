import { geocoding, config } from "@maptiler/client";
import { map } from "../map/core.js";
import {
  renderResults,
  getZoomLevel,
  flyToPlace,
} from "./ui.js";

config.apiKey = "Ejb6rQSPI4GfmBnOhiEQ";

export async function searchPlace(query) {
  const center = map.getCenter();
  const data = await geocoding.forward(query, {
    types: ["poi", "address", "locality", "municipality", "place"],
    limit: 5,
    proximity: [center.lng, center.lat],
    language: ["en"],
  });

  const feature = data.features[0];
  if (!feature) return null;

  const [lon, lat] = feature.center;
  const zoom = getZoomLevel(feature);

  console.log(feature.place_name, [lon, lat], zoom);

  flyToPlace([lon, lat], zoom);
  return [lon, lat];
}

export function setupSearchListeners() {
  const searchForm = document.getElementById("search-form");
  const searchInp = document.getElementById("search-input");
  const outputList = document.getElementById("output");

  if (!searchForm || !searchInp || !outputList) {
    console.warn("Search DOM elements not found; skipping search setup");
    return;
  }

  let debounceTimer;

  searchInp.addEventListener("input", () => {
    clearTimeout(debounceTimer);

    outputList.hidden = searchInp.value === "";

    const center = map.getCenter();

    debounceTimer = setTimeout(async () => {
      const query = searchInp.value.trim();

      if (!query) {
        renderResults([]);
        return;
      }

      const data = await geocoding.forward(query, {
        types: ["poi", "address", "locality", "municipality", "place"],
        limit: 5,
        proximity: [center.lng, center.lat],
        language: ["en"],
      });

      renderResults(data.features || []);
    }, 300);
  });

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    searchPlace(searchInp.value);
  });
}