import { SeatZone } from '@prisma/client';

export const generateSeatZone = (data) => {
  const zones = [];
  for (const [key, value] of Object.entries<'String'>(data)) {
    zones.push({
      name: key,
      price:
        Math.round(
          (parseFloat(value.replace(',', '.')) * 100 + 0.00001) * 100,
        ) / 100,
    });
  }
  return zones;
};
