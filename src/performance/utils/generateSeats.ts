import { SeatZone } from '@prisma/client';

type seat = {
  row: number;
  seat: number;
  zoneId: number;
  performanceId: number;
  placement: string;
  id?: number;
  transactionId?: number;
};

export function generateSeats(
  seatSchema,
  performanceId: number,
  zonesFromDb: SeatZone[],
) {
  let seatArray = [];
  //Literujemy obiek przez umiejscowienie scena lub balkon
  for (const place in seatSchema) {
    //Literujemy przez rzędy i otrzymujemy objekt ze strefami
    for (const row in seatSchema[place]) {
      //Literujemy przez strefy i otrzymujemy liczbę miejsc
      for (const zone in seatSchema[place][row]) {
        const start = seatSchema[place][row][zone][0];
        const end = seatSchema[place][row][zone][1];
        for (let i = start; i <= end; i++) {
          const findeIndexOfZone = zonesFromDb.findIndex((z) => {
            return z.name === zone;
          });
          if (findeIndexOfZone === -1) throw new Error('Zone doesnt exist');
          const newSeat = {
            row: Number(row),
            seat: i,
            zoneId: zonesFromDb[findeIndexOfZone].id,
            performanceId: performanceId,
            placement: place,
          };
          seatArray = [...seatArray, newSeat];
        }
      }
    }
  }
  return seatArray;
}
//375
