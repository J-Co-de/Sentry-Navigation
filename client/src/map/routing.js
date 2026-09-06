import polyline from "@mapbox/polyline";
import { map } from "./core.js";
import { pinnedPoints } from "./markers.js";

export let route = {};
let latestRequest = 0;

export async function fetchRoute() {
  if (pinnedPoints.length < 2) {
    clearRoute();
    return;
  }

  const requestId = ++latestRequest;

  const locations = pinnedPoints.map(({ coordinates: [lng, lat] }) => ({
    lat,
    lon: lng,
  }));

  const response = await fetch("/route", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      locations,
      costing: "auto",
      directions_options: { units: "miles" },
    }),
  });

  if (!response.ok) throw new Error(`Route request failed: ${response.status}`);

  const data = await response.json();
  if (requestId !== latestRequest) return;

  if (!data?.trip?.legs) {
    console.warn("No legs found in route response:", data);
    return;
  }

  const coords = [];

  for (const leg of data.trip.legs) {
    if (!leg.shape) {
      console.warn("Leg missing shape:", leg);
      continue;
    }
    // Valhalla encodes polyline at precision 6
    const decoded = polyline
      .decode(leg.shape, 6)
      .map(([lat, lon]) => [lon, lat]);
    console.log(`Decoded ${decoded.length} points from leg shape`);
    coords.push(...decoded);
  }

  if (coords.length > 0) {
    drawRoute(coords);
  } else {
    console.warn("No coordinates decoded; route not drawn");
  }

  route = data;
  return data;
}

function clearRoute() {
  try {
    if (map.getLayer("route-line")) {
      map.removeLayer("route-line");
    }
    if (map.getSource("route")) {
      map.removeSource("route");
    }
  } catch (e) {
    console.warn("Failed to clear route:", e);
  }
}

function drawRoute(coords) {
  // Defer until style finishes loading (fires exactly once)
  if (!map.isStyleLoaded()) {
    map.once("style.load", () => drawRoute(coords));
    return;
  }

  try {
    if (map.getSource("route")) {
      map.getSource("route").setData({
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: coords },
      });
    } else {
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: coords },
        },
      });

      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: {
          "line-color": "#3DB9FF",
          "line-width": 5,
        },
      });
    }
  } catch (e) {
    console.error("Failed to draw route:", e);
  }
}