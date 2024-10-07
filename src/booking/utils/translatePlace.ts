export const translatePlace = (s: string) => {
  let placement;
  switch (s) {
    case 'Ground':
      placement = 'Parter';
      break;
    case 'Level':
      placement = 'Balkon';
      break;
  }
  return placement;
};
