export let pinnedPoints = [];
export const map = new maplibregl.Map({
  container: "map",
  style: {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: [
          "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        attribution: "&copy; OpenStreetMap contributors",
      },
    },
    layers: [
      {
        id: "osm-layer",
        type: "raster",
        source: "osm",
      },
    ],
  },
  center: [-95.9928, 36.0607],
  zoom: 11,
});

map.on("click", (e) => {
  const { lng, lat } = e.lngLat;
  const marker = new maplibregl.Marker({ draggable: true })
    .setLngLat([lng, lat])
    .addTo(map);

  const key = pinnedPoints.length;

  marker["key"] = key;
  pinnedPoints.push({ lng, lat });

  console.log(
    fetchRoute().then((data) => {
      console.log("Route data:", data);
    }),
  );

  marker.on("dragend", () => {
    const lngLat = marker.getLngLat({ lng, lat });
    pinnedPoints[marker.key] = lngLat;
    console.log(
      fetchRoute().then((data) => {
        console.log("Route data:", data);
      }),
    );
    console.log(`New position: ${lngLat.lng}, ${lngLat.lat}`);
  });

  marker.getElement().addEventListener("click", function (e) {
    pinnedPoints.splice(marker.key, 1);
    marker.remove();
    e.stopPropagation();
    pinnedPoints.forEach((point, index) => {
      point.key = index;
    });
    console.log(
      fetchRoute().then((data) => {
        console.log("Route data:", data);
      }),
    );
  });
});

async function fetchRoute() {
  if (pinnedPoints.length >= 2) {
    const locations = pinnedPoints.map((point) => ({
      lat: point.lat,
      lon: point.lng,
    }));
    const response = await fetch("http://localhost:3000/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locations: locations,
        costing: "auto",
        directions_options: { units: "miles" },
      }),
    });

    if (!response.ok) {
      throw new Error(`Route request failed: ${response.status}`);
    }

    return response.json();
  }
}
