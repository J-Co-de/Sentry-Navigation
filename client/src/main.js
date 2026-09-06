import './general.css'
import './map-ui.css'
import { setupMarkerClickHandler } from './map/markers.js'
import { fetchRoute } from './map/routing.js'
import { getWeather, alwaysFreeze, conditionalFreeze } from './weather/api.js'
import { setupSearchListeners } from './search/search.js'
import './native.js'

function isBridgeSafe(weather) {
  const id = String(weather.conditionId);
  if (weather.temp <= 35) {
    if (["Rain", "Snow"].includes(weather.conditionString)) {
      if (weather.rain >= 0.1 || weather.snow >= 0.1) {
        return false;
      }
    }

    let isFroze = conditionalFreeze.some((regex) =>
      regex.test(id),
    );
    if (isFroze) return false;

    if (weather.temp <= 32) {
      isFroze = alwaysFreeze.some((regex) => regex.test(id));
      if (isFroze) return false;
    }
  }

  return true;
}

async function init() {
  try {
    // Set up map interactions
    setupMarkerClickHandler();
    setupSearchListeners();

    const weather = await getWeather();
    console.log(
      isBridgeSafe(weather)
        ? "You can use bridges!"
        : "You can not use bridges!",
    );

    const routeData = await fetchRoute();
    console.log("Route data:", routeData);
  } catch (error) {
    console.error("Initialization failed:", error);
  }
}

init();
