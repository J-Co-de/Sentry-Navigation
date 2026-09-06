import polyline from "@mapbox/polyline";
import { map } from "./core.js";
import { pinnedPoints } from "./markers.js";

export let route = {};

export async function fetchRoute() {
  if (pinnedPoints.length < 2) return;

  const locations = pinnedPoints.map((p) => ({ lat: p.lat, lon: p.lng }));

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

function drawRoute(coords) {
  function addOrUpdate() {
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
  }

  if (map.isStyleLoaded()) {
    addOrUpdate();
  } else {
    map.once("style.load", addOrUpdate);
  }
}