import maplibregl from "maplibre-gl";
import { map } from "./core.js";
import { fetchRoute } from "./routing.js";

export let pinnedPoints = [];

let markerIdCounter = 0;
const markers = new Map();

export function setupMarkerClickHandler() {
  map.on("click", (e) => {
    const { lng, lat } = e.lngLat;
    const marker = new maplibregl.Marker({ draggable: true })
      .setLngLat([lng, lat])
      .addTo(map);

    const markerId = ++markerIdCounter;
    markers.set(markerId, marker);
    pinnedPoints.push({ lng, lat, markerId });

    fetchRoute();

    marker.on("dragend", () => {
      const lngLat = marker.getLngLat();
      const idx = pinnedPoints.findIndex((p) => p.markerId === markerId);
      if (idx !== -1) {
        pinnedPoints[idx].lng = lngLat.lng;
        pinnedPoints[idx].lat = lngLat.lat;
      }
      fetchRoute();
      console.log(`New position: ${lngLat.lng}, ${lngLat.lat}`);
    });

    marker.getElement().addEventListener("click", function (e) {
      const idx = pinnedPoints.findIndex((p) => p.markerId === markerId);
      if (idx !== -1) pinnedPoints.splice(idx, 1);
      markers.delete(markerId);
      marker.remove();
      e.stopPropagation();
      fetchRoute();
    });
  });
}