import { map } from "../map/core.js";

const TYPE_ICONS = {
  // Map pin icon for points of interest.
  poi: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="result-icon"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`,
  // House icon for street addresses.
  address: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="result-icon"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
  // Building icon for local areas or neighborhoods.
  locality: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="result-icon"><path d="M10 12h4"/><path d="M10 8h4"/><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/></svg>`,
  // Landmark icon for municipalities or towns.
  municipality: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="result-icon"><path d="M10 18v-7"/><path d="M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/></svg>`,
  // Globe icon for broader places such as cities or regions.
  place: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="result-icon"><path d="M21.54 15H17a2 2 0 0 0-2 2v4.54"/><path d="M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17"/><path d="M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05"/><circle cx="12" cy="12" r="10"/></svg>`,
};

export function getTypeIcon(feature) {
  const type =
    feature.properties?.category || feature.place_type?.[0] || "place";
  return TYPE_ICONS[type] || TYPE_ICONS.place;
}

export function formatPlaceName(feature) {
  const placeName = feature.place_name || feature.text || "Location";

  if (placeName.length <= 40) {
    return placeName;
  }

  let trimmed = placeName.slice(0, 40).trim();
  if (trimmed.endsWith(",")) {
    trimmed = trimmed.slice(0, -1);
  }

  return `${trimmed}...`;
}

export function renderResults(features) {
  const outputList = document.getElementById("output");
  if (!outputList) return;

  outputList.innerHTML = "";

  if (!features || features.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "No locations found";
    outputList.appendChild(emptyItem);
    return;
  }

  features.forEach((feature) => {
    const item = document.createElement("li");
    const label = formatPlaceName(feature);
    const icon = getTypeIcon(feature);

    item.innerHTML = `${icon}<span class="result-label">${label}</span>`;
    item.addEventListener("click", () => {
      flyToPlace(feature.center, getZoomLevel(feature));
    });

    outputList.appendChild(item);
  });
}

export function getZoomLevel(feature) {
  const category =
    feature.properties?.category || feature.place_type?.[0] || "place";

  switch (category) {
    case "poi":
    case "address":
      return 18;
    case "locality":
      return 16;
    case "municipality":
      return 13;
    case "place":
      console.log(category);
      return 10;
    default:
      return 0;
  }
}

export function getDistanceKm(lng1, lat1, lng2, lat2) {
  const radius = 6371;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(deltaLng / 2) ** 2;

  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function flyToPlace(result, zoom = 10) {
  const [lon, lat] = result;
  const center = map.getCenter();
  const distance = getDistanceKm(center.lng, center.lat, lon, lat);

  if (distance > 150) {
    map.jumpTo({ center: [lon, lat], zoom: 20 });
    return;
  }

  map.flyTo({
    center: [lon, lat],
    zoom,
    speed: 1.2,
    curve: 1.4,
  });
}