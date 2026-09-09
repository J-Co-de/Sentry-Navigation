/**
 * safety_weights.js - Sentry Navigation
 * ============================================================================
 * THOUGHT PROCESS:
 * This is the bridge between weather data (OpenWeatherMap) and our
 * C++ safety costing model in Valhalla. Valhalla doesn't know about
 * weather - it just gets a costing model with weights. This file:
 *
 * 1. Takes weather from your OpenWeatherMap API call
 * 2. Computes dynamic safety weights based on current conditions
 * 3. Passes those weights to Valhalla as costing_options
 *
 * The key concept: rain makes an unpaved dirt road 2x more dangerous,
 * but a well-drained divided highway only marginally so.
 * These weights are PRE-MULTIPLIERS that feed into ComputeSafetyFactor().
 * ============================================================================
 */

const DEFAULT_SAFETY_WEIGHTS = {
  road_class_factor:       [0.95, 0.95, 1.05, 1.10, 1.25, 1.35, 1.30, 1.60],
  speed_band_factors:      [0.85, 0.95, 1.05, 1.20, 1.40],
  surface_paved_factor:    1.00,
  surface_gravel_factor:   1.30,
  surface_dirt_factor:     2.00,
  surface_unpaved_factor:  1.80,
  surface_unknown_factor:  1.15,
  divided_road_boost:      0.85,
  shoulder_boost:          0.92,
  sidewalk_boost:          0.93,
  lit_road_boost:          0.80,
  bridge_factor:           1.10,
  tunnel_factor:           1.05,
  left_turn_penalty:       1.80,
  right_turn_penalty:      1.15,
  uturn_penalty:           2.50,
  straight_boost:          0.90,
  ramp_factor:             1.05,
  track_factor:            2.00,
  driveway_factor:         2.50,
  alley_factor:            2.00,
  parking_factor:          1.80,
  ferry_factor:            3.00,
  safety_vs_speed_balance: 0.70,
};
export function computeSafetyWeights(weather) {
  const w = JSON.parse(JSON.stringify(DEFAULT_SAFETY_WEIGHTS));
  if (weather.rain > 5.0) {
    w.surface_paved_factor *= 1.15; w.surface_gravel_factor *= 1.40;
    w.surface_dirt_factor *= 1.60; w.surface_unpaved_factor *= 1.50;
    w.speed_band_factors = w.speed_band_factors.map(f => f * 1.10);
    w.bridge_factor *= 1.15;
  } else if (weather.rain > 2.5) {
    w.surface_paved_factor *= 1.08; w.surface_gravel_factor *= 1.20;
    w.surface_dirt_factor *= 1.30; w.surface_unpaved_factor *= 1.25;
    w.speed_band_factors = w.speed_band_factors.map(f => f * 1.05);
  } else if (weather.rain > 0.5) {
    w.surface_paved_factor *= 1.03; w.surface_gravel_factor *= 1.08;
    w.surface_dirt_factor *= 1.12; w.surface_unpaved_factor *= 1.10;
  }
  if (weather.snow > 2.0) {
    w.surface_paved_factor *= 1.40; w.surface_gravel_factor *= 2.00;
    w.surface_dirt_factor *= 3.00; w.surface_unpaved_factor *= 2.50;
    w.speed_band_factors = w.speed_band_factors.map(f => f * 1.30);
    w.bridge_factor *= 1.50; w.track_factor *= 2.00;
    w.driveway_factor *= 2.00; w.lit_road_boost *= 1.30;
  } else if (weather.snow > 0) {
    w.surface_paved_factor *= 1.15; w.surface_gravel_factor *= 1.30;
    w.surface_dirt_factor *= 1.50; w.surface_unpaved_factor *= 1.35;
    w.speed_band_factors = w.speed_band_factors.map(f => f * 1.10);
    w.bridge_factor *= 1.20; w.track_factor *= 1.30;
  }
  if (weather.temp <= 32) {
    w.bridge_factor *= 1.30; w.surface_unpaved_factor *= 1.20;
    w.lit_road_boost *= 1.40; w.surface_paved_factor *= 1.08;
  }
  if (weather.temp <= 28) {
    w.bridge_factor *= 1.40; w.track_factor *= 1.50;
    w.driveway_factor *= 1.50; w.surface_paved_factor *= 1.12;
  }
  if (weather.visibility < 200) {
    w.speed_band_factors = w.speed_band_factors.map(f => f * 1.35);
    w.left_turn_penalty *= 1.30; w.right_turn_penalty *= 1.15;
    w.uturn_penalty *= 1.30; w.lit_road_boost *= 1.40;
  } else if (weather.visibility < 1000) {
    w.speed_band_factors = w.speed_band_factors.map(f => f * 1.15);
    w.left_turn_penalty *= 1.10; w.lit_road_boost *= 1.15;
  }
  if (weather.windGust > 40) {
    w.bridge_factor *= 1.30;
    w.speed_band_factors = w.speed_band_factors.map(f => f * 1.10);
  } else if (weather.windSpeed > 25) {
    w.bridge_factor *= 1.15;
    w.speed_band_factors = w.speed_band_factors.map(f => f * 1.05);
  }
  const hour = new Date().getHours();
  if (hour < 6 || hour >= 20) {
    w.lit_road_boost *= 1.10;
    w.speed_band_factors = w.speed_band_factors.map(f => f * 1.08);
  }
  const score = computeDangerScore(weather);
  if (score > 50) w.safety_vs_speed_balance = 0.90;
  else if (score > 30) w.safety_vs_speed_balance = 0.80;
  else if (score > 15) w.safety_vs_speed_balance = 0.75;
  return w;
}

function computeDangerScore(weather) {
  let s = 0;
  if (weather.temp <= 28) s += 25;
  else if (weather.temp <= 32) s += 15;
  else if (weather.temp <= 35) s += 5;
  if (weather.rain > 5.0) s += 25;
  else if (weather.rain > 2.5) s += 15;
  else if (weather.rain > 0.5) s += 5;
  if (weather.snow > 2.0) s += 35;
  else if (weather.snow > 0.5) s += 20;
  else if (weather.snow > 0) s += 10;
  if (weather.visibility < 200) s += 20;
  else if (weather.visibility < 1000) s += 10;
  if (weather.windGust > 50) s += 15;
  else if (weather.windGust > 40) s += 8;
  else if (weather.windSpeed > 25) s += 5;
  const hour = new Date().getHours();
  if (hour < 6 || hour >= 20) s += 5;
  return Math.min(s, 100);
}

export function getSafetyStatus(weather) {
  const s = computeDangerScore(weather);
  if (s >= 60) return {
    level: "DANGEROUS", color: "#FF0000",
    message: "Hazardous conditions. Consider delaying travel." };
  if (s >= 35) return {
    level: "CAUTION", color: "#FFA500",
    message: "Adverse conditions. Route optimized for safety." };
  if (s >= 15) return {
    level: "ELEVATED", color: "#FFD700",
    message: "Minor weather concerns. Slight safety routing." };
  return {
    level: "NORMAL", color: "#00FF00",
    message: "Clear conditions. Standard routing active." };
}