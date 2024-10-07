import { Performances } from '@prisma/client';

export function SortPerformance(performance: Performances[]) {
  if (performance.length === 0) return [];

  const PerfomanceNewArray = [];

  PerfomanceNewArray.push(transformData(performance[0]));

  for (let a = 1; a < performance.length; a++) {
    let nameIsInArray = false;
    let dateIsInArray = false;
    let indexOfExistingElementInArray;
    const newPerformance = transformData(performance[a]);
    let i = 0;
    for (const singlePerformance of PerfomanceNewArray) {
      if (newPerformance.name === singlePerformance.name) {
        nameIsInArray = true;
      }
      if (newPerformance.date.getTime() === singlePerformance.date.getTime()) {
        dateIsInArray = true;
      }
      if (nameIsInArray && dateIsInArray) {
        indexOfExistingElementInArray = i;
        break;
      }
      i++;
    }
    if (nameIsInArray && dateIsInArray) {
      PerfomanceNewArray[indexOfExistingElementInArray] = {
        ...PerfomanceNewArray[indexOfExistingElementInArray],
        spectacleTimeList: [
          ...PerfomanceNewArray[indexOfExistingElementInArray]
            .spectacleTimeList,
          ...newPerformance.spectacleTimeList,
        ],
      };
    } else {
      PerfomanceNewArray.push(newPerformance);
    }
  }

  return PerfomanceNewArray;
}

type convertedPerormanceArray = {
  name: string;
  description: string;
  imageUrl: string;
  date: Date;
  spectacleTimeList: { time: string; url: string }[];
};

function transformData(performance: Performances): convertedPerormanceArray {
  return {
    name: performance.name,
    description: performance.description,
    date: performance.date,
    imageUrl: performance.imageUrl,
    spectacleTimeList: new Array({
      time: performance.time,
      url: performance.uniqueUrl,
    }),
  };
}

//Date
//Time
