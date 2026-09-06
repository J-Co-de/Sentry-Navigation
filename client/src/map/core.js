import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export const map = new maplibregl.Map({
  container: "map",
  style:
    "https://api.maptiler.com/maps/streets-v2-dark/style.json?key=Ejb6rQSPI4GfmBnOhiEQ",
  center: [-95.9928, 36.0607],
  zoom: 11,
});