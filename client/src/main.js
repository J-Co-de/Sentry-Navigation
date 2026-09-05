import './general.css'
import './map-ui.css'
import * as mapScript from './map.js'
import * as weatherScript from './weather.js'
import './search.js'
import './native.js'

function isBridgeSafe(weather) {
  const id = String(weather.conditionId);
  if (weather.temp <= 35) {
    if (["Rain", "Snow"].includes(weather.conditionString)) {
      if (weather.rain >= 0.1 || weather.snow >= 0.1) {
        return false;
      }
    }

    let isFroze = weatherScript.conditionalFreeze.some((regex) =>
      regex.test(id),
    );
    if (isFroze) return false;

    if (weather.temp <= 32) {
      isFroze = weatherScript.alwaysFreeze.some((regex) => regex.test(id));
      if (isFroze) return false;
    }
  }

  return true;
}

async function init() {
  try {
    const weather = await weatherScript.getWeather();
    console.log(
      isBridgeSafe(weather)
        ? "You can use bridges!"
        : "You can not use bridges!",
    );

    const routeData = await mapScript.fetchRoute();
    console.log("Route data:", routeData);
  } catch (error) {
    console.error("Initialization failed:", error);
  }
}

init();
