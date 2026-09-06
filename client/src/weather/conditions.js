export const alwaysFreeze = [
  /^511$/, // freezing rain
  /^6(0[0-2]|1[1-6]|2[0-2])$/, // 600–622 snow/sleet
  /^701$/, // mist
  /^741$/, // fog
  /^771$/, // squall
  /^781$/, // tornado
];

export const conditionalFreeze = [
  /^2(0[0-9]|1[0-9]|2[0-9])$/, // 200–232 thunderstorms
  /^3(0[0-9]|1[0-9]|2[0-1])$/, // 300–321 drizzle
  /^5(0[0-9]|1[0-9]|2[0-9]|3[0-1])$/, // 500–531 rain
];