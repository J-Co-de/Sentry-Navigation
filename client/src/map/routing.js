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
      costing: "sentry",
      costing_options: {
        sentry: {
          safety_options: {
            road_class_factor: [0.95, 0.95, 1.05, 1.1, 1.25, 1.35, 1.3, 1.6],
            night_penalty: 1.15,
            fog_penalty: 1.3,
            snow_penalty: 1.5,
            icing_penalty: 2.0,
            safety_vs_speed_balance: 0.7,
            is_night: true,
            temperature_celsius: -2,
            rain_mm_per_hour: 0.0,
            snow_mm_per_hour: 3.0,
            visibility_meters: 400,
            wind_speed_mps: 12,
          },
        },
      },
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
  try {
    if (map.getSource("route")) {
      map.getSource("route").setData({
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: coords },
      });
      console.log("it worked continue");
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
      console.log("it worked start");
    }
  } catch (e) {
    console.error("Failed to draw route:", e);
  }
}
