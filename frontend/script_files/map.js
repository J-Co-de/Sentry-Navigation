import polyline from "https://cdn.skypack.dev/@mapbox/polyline";

export let pinnedPoints = [];
export let route = {};

let markerIdCounter = 0;
const markers = new Map();

export const map = new maplibregl.Map({
  container: "map",
  style:
    "https://api.maptiler.com/maps/streets-v2-dark/style.json?key=Ejb6rQSPI4GfmBnOhiEQ",
  center: [-95.9928, 36.0607],
  zoom: 11,
});

// Add user's current position as the first pinned point

map.on("click", (e) => {
  const { lng, lat } = e.lngLat;
  const marker = new maplibregl.Marker({ draggable: true })
    .setLngLat([lng, lat])
    .addTo(map);

  const markerId = ++markerIdCounter;
  markers.set(markerId, marker);
  pinnedPoints.push({ lng, lat, markerId });

  fetchRoute().then((data) => {
    route = data;
  });

  marker.on("dragend", () => {
    const lngLat = marker.getLngLat();
    const idx = pinnedPoints.findIndex((p) => p.markerId === markerId);
    if (idx !== -1) {
      pinnedPoints[idx].lng = lngLat.lng;
      pinnedPoints[idx].lat = lngLat.lat;
    }
    fetchRoute().then((data) => {
      route = data;
    });
    console.log(`New position: ${lngLat.lng}, ${lngLat.lat}`);
  });

  marker.getElement().addEventListener("click", function (e) {
    const idx = pinnedPoints.findIndex((p) => p.markerId === markerId);
    if (idx !== -1) pinnedPoints.splice(idx, 1);
    markers.delete(markerId);
    marker.remove();
    e.stopPropagation();
    fetchRoute().then((data) => {
      route = data;
    });
  });
});

export async function fetchRoute() {
  if (pinnedPoints.length < 2) return;

  const locations = pinnedPoints.map((p) => ({ lat: p.lat, lon: p.lng }));

  const response = await fetch("http://localhost:3000/route", {
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
