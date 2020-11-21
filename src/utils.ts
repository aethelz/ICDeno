export function getSizeDifference(
  newSize: number,
  originalSize: number
): string {
  const delta = originalSize / newSize;
  let comparison = "no size change";
  if (delta > 1) {
    const percent = Math.round((delta - 1) * 100) + "%";
    comparison = `${percent === "0%" ? "slightly" : percent} bigger`;
  } else if (delta < 1) {
    const percent = Math.round((1 - delta) * 100) + "%";
    comparison = `${percent === "0%" ? "slightly" : percent} smaller`;
  } else {
    // No size changes
  }
  return comparison;
}
