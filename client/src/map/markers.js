import maplibregl from "maplibre-gl";
import { map } from "./core.js";
import { fetchRoute } from "./routing.js";

export let pinnedPoints = [];

let markerIdCounter = 0;
const markers = new Map();
let userLocationMarkerId = null;

export default function initializeMarker(lngLat) {
  const [lng, lat] = lngLat;
  const exists = pinnedPoints.some(
    (p) => p.coordinates[0] === lng && p.coordinates[1] === lat,
  );
  if (!exists) {
    const marker = new maplibregl.Marker().setLngLat([lng, lat]).addTo(map);

    const markerId = ++markerIdCounter;
    markers.set(markerId, marker);
    pinnedPoints.push({ coordinates: [lng, lat], id: markerId });

    marker.getElement().addEventListener("click", function (e) {
      const idx = pinnedPoints.findIndex((p) => p.id === markerId);
      if (idx !== -1) pinnedPoints.splice(idx, 1);
      markers.delete(markerId);
      if (userLocationMarkerId === markerId) userLocationMarkerId = null;
      marker.remove();
      e.stopPropagation();
      fetchRoute();
    });
    return markerId;
  }

  return pinnedPoints.find(
    (p) => p.coordinates[0] === lng && p.coordinates[1] === lat,
  )?.id;
}

/**
 * Register (or re-register) the user's current-location marker so
 * clearDestinationMarkers knows which pin to preserve.
 */
export function setUserMarker(lngLat) {
  const id = initializeMarker(lngLat);
  userLocationMarkerId = id;
}

/**
 * Remove every pinned marker EXCEPT the user-location marker.
 * Keeps pinnedPoints & the internal marker Map in sync.
 */
export function clearDestinationMarkers() {
  const toRemove = [];
  for (const [id, marker] of markers) {
    if (id !== userLocationMarkerId) toRemove.push(id);
  }
  for (const id of toRemove) {
    const marker = markers.get(id);
    if (marker) {
      marker.remove();
      markers.delete(id);
    }
  }
  pinnedPoints = pinnedPoints.filter((p) => p.id === userLocationMarkerId);
}
