import { map } from "../map/core.js";
import initializeMarker from "../map/markers.js";
import { fetchRoute } from "../map/routing.js";
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
  // Storefront icon for shops and amenities.
  shop: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="result-icon"><path d="M3 9h18l-1.5-5h-15z"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/><path d="M3 9a3 3 0 0 0 6 0a3 3 0 0 0 6 0a3 3 0 0 0 6 0"/></svg>`,
  // Utensils icon for restaurants and cafes.
  restaurant: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="result-icon"><path d="M7 2v20"/><path d="M3 2v6a4 4 0 0 0 8 0V2"/><path d="M19 2v20"/><path d="M19 2a4 4 0 0 0-4 4v5h4"/></svg>`,
  // Road icon for streets and roads.
  street: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="result-icon"><path d="m19 3-5 18"/><path d="M5 3l5 18"/><path d="M12 3v3"/><path d="M12 9v3"/><path d="M12 15v3"/></svg>`,
  // Area icon for neighborhoods and districts.
  neighbourhood: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="result-icon"><path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><path d="M9 21v-5h6v5"/><path d="M8 11h1"/><path d="M15 11h1"/></svg>`,
};

let userLocation = null;

getLocation()
  .then(loc => {
    userLocation = loc;
    initializeMarker(loc); // or store it for later
  })
  .catch(err => console.warn(err.message));


TYPE_ICONS.amenity = TYPE_ICONS.poi;
TYPE_ICONS.fast_food = TYPE_ICONS.restaurant;
TYPE_ICONS.cafe = TYPE_ICONS.restaurant;
TYPE_ICONS.neighborhood = TYPE_ICONS.neighbourhood;
TYPE_ICONS.quarter = TYPE_ICONS.neighbourhood;
TYPE_ICONS.locality = TYPE_ICONS.locality;
TYPE_ICONS.town = TYPE_ICONS.locality;
TYPE_ICONS.village = TYPE_ICONS.locality;
TYPE_ICONS.hamlet = TYPE_ICONS.locality;
TYPE_ICONS.city = TYPE_ICONS.municipality;
TYPE_ICONS.district = TYPE_ICONS.municipality;
TYPE_ICONS.county = TYPE_ICONS.municipality;
TYPE_ICONS.region = TYPE_ICONS.place;
TYPE_ICONS.state = TYPE_ICONS.place;
TYPE_ICONS.country = TYPE_ICONS.place;
TYPE_ICONS.continent = TYPE_ICONS.place;
TYPE_ICONS.unknown = TYPE_ICONS.place;

export function getTypeIcon(feature) {
  const type = getCategory(feature);
  return TYPE_ICONS[type] || TYPE_ICONS.place;
}

export function getCategory(feature) {
  const props = feature.properties || {};

  // 1. POI-specific fields (strongest signal)
  if (props.category) return props.category;
  if (props.subclass) return props.subclass;
  if (props.class) return props.class;

  // 2. MapTiler geocoder POI fallback
  if (feature.place_type?.[0] === "poi") return "poi";

  // 3. Geographic place designation (city, town, village, quarter)
  if (props.place_designation) return props.place_designation;

  // 4. MapTiler place_type_name (locality, region, country)
  if (feature.place_type_name?.length) return feature.place_type_name[0];

  // 5. MapTiler place_type (place, region, country)
  if (feature.place_type?.length) return feature.place_type[0];

  return "unknown";
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
  const category = getCategory(feature);
  console.log("feature:", feature);
  console.log("category:", category);

  switch (category) {
    // POIs
    case "poi":
    case "amenity":
    case "shop":
    case "restaurant":
    case "fast_food":
    case "cafe":
      return 16;

    // Addresses & streets
    case "address":
    case "street":
      return 17;

    // Neighbourhood-level
    case "neighbourhood":
      return 16;

    // Quarter (OSM: place=quarter)
    case "quarter":
      return 14;

    // Locality / town / village
    case "locality":
    case "town":
    case "village":
    case "hamlet":
      return 15;

    // Municipality / city
    case "municipality":
    case "city":
      return 13;

    // District / county
    case "district":
    case "county":
      return 11;

    // Region / state
    case "region":
    case "state":
      return 8;

    // Country
    case "country":
      return 4;

    // Continent (rare but possible)
    case "continent":
      return 2;

    // Fallback
    case "unknown":
    default:
      return 10;
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

function getLocation() {
  if (!navigator.geolocation) {
    return Promise.reject(
      new Error("Geolocation is not supported by your browser."),
    );
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve([position.coords.longitude, position.coords.latitude]);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("User denied the request for Geolocation."));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Location information is unavailable."));
            break;
          case error.TIMEOUT:
            reject(new Error("The request to get user location timed out."));
            break;
          default:
            reject(new Error("An unknown geolocation error occurred."));
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  });
}

export async function flyToPlace(result, zoom = 10) {
  const [lon, lat] = result;
  const center = map.getCenter();
  const distance = getDistanceKm(center.lng, center.lat, lon, lat);

  // 1. Get current location first

  // 2. Add markers AFTER all async work is done
  if (userLocation) {
    initializeMarker(userLocation);
  }

  initializeMarker([lon, lat]);

  // 3. Wait for markers to exist before routing
  await Promise.resolve(); // allow DOM/MapLibre to finish marker rendering

  const route = await fetchRoute();

  // 4. Only animate AFTER route is drawn
  if (distance > 150) {
    map.jumpTo({ center: [lon, lat], zoom });
    return;
  }

  map.flyTo({
    center: [lon, lat],
    zoom,
    speed: 1.2,
    curve: 1.4,
  });
}
