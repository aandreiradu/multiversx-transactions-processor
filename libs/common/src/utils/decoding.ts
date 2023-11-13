export const convertTokenValue = (value: string): number => {
  const decimals = 18;
  return +value > 0
    ? +(parseFloat(value) / Math.pow(10, decimals)).toFixed(4)
    : +value;
};
