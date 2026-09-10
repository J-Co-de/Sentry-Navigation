import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export const map = new maplibregl.Map({
  container: "map",
  style:
    `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`,
  center: [-95.9928, 36.0607],
  zoom: 11,
});