import { alwaysFreeze, conditionalFreeze } from "./conditions.js";

const apiKey = "855e80a07a1ba9c76233de0a8841350d";
const city = "Glenpool";
const units = "Imperial";

export { alwaysFreeze, conditionalFreeze };

export async function getWeather() {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`,
  );

  if (!res.ok) {
    throw new Error(`Weather request failed: ${res.status}`);
  }

  const rawData = await res.json();

  if (!rawData.weather || !rawData.weather.length) {
    throw new Error("Weather payload was missing weather data");
  }

  const conditionId = rawData.weather[0].id;
  const conditionString = rawData.weather[0].description;
  const visibility = rawData.visibility;
  const windSpeed = rawData.wind.speed;
  const windGust = rawData.wind.gust ?? 0;
  const windDeg = rawData.wind.deg ?? 0;
  const temp = rawData.main.temp;
  const feelsLike = rawData.main.feels_like;
  const rain = rawData.rain?.["1h"] ?? 0;
  const snow = rawData.snow?.["1h"] ?? 0;

  return {
    conditionId,
    conditionString,
    visibility,
    windSpeed,
    windGust,
    windDeg,
    temp,
    feelsLike,
    rain,
    snow,
  };
}