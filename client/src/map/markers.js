import maplibregl from "maplibre-gl";
import { map } from "./core.js";
import { fetchRoute } from "./routing.js";

export let pinnedPoints = [];

let markerIdCounter = 0;
const markers = new Map();
export default function initializeMarker(lngLat) {
  const [lng, lat] = lngLat;
  const exists = pinnedPoints.some(
    (p) => p.coordinates[0] === lng && p.coordinates[1] === lat,
  );
  if (!exists) {
    const marker = new maplibregl.Marker({ draggable: true })
      .setLngLat([lng, lat])
      .addTo(map);

    const markerId = ++markerIdCounter;
    markers.set(markerId, marker);
    pinnedPoints.push({ coordinates: [lng, lat], id: markerId });

    marker.getElement().addEventListener("click", function (e) {
      const idx = pinnedPoints.findIndex((p) => p.id === markerId);
      if (idx !== -1) pinnedPoints.splice(idx, 1);
      markers.delete(markerId);
      marker.remove();
      e.stopPropagation();
      fetchRoute();
    });
  }
  console.log(pinnedPoints);
}
