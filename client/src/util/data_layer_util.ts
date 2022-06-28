/**
 * Converts list of legend pairs (alternating numerical key, string hex color
 * value) to a map of legend key : color hex.
 * @param colorMapping the list of legend pairs
 *
 * Example:
 * [0, '#9fcd7c', 10000, '#f7e5af'] => {'0' :  '#9fcd7c', '10000', '#f7e5af'}
 */
export function colorMapToBuckets(colorMapping: any[]): Map<string, string> {
  const listOfLegendPairs: [string, string][] = [];
  for (let index = 0; index < colorMapping.length; index++) {
    if (index % 2 != 0) {
      listOfLegendPairs.push([colorMapping[index - 1].toString(), colorMapping[index]]);
    }
  }
  return new Map(listOfLegendPairs);
}

const LOCALHOST = 'localhost';

/**
 * Hostname of tileserver to be passed to mapbox.
 *
 * Returns location.hostname unless app is being run locally.
 */
export function tileServerHost() {
  console.log(process.env.VUE_APP_DEFAULT_TILESERVER_HOST);
  return location.hostname == LOCALHOST ? 'd1u8e52u3wqvp1.cloudfront.net' : location.hostname;
}
