// converted from https://gist.github.com/jhermsmeier/72626d5fd79c5875248fd2c1e8162489

const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Convert [lat,lon] polar coordinates to [x,y,z] cartesian coordinates
 * @param {Number} lon
 * @param {Number} lat
 * @param {Number} radius
 * @return {Vector3}
 */
export function polarToCartesian(
  lon: number,
  lat: number,
  radius: number
): Vector3 {
  if (!lon || !lat || !radius) throw Error("Coordinate not valid.");

  const phi = (90 - lat) * DEG2RAD;
  const theta = (lon + 180) * DEG2RAD;

  return {
    x: -(radius * Math.sin(phi) * Math.sin(theta)),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.cos(theta)
  };
}

/**
 * Convert [x,y,z] cartesian coordinates to polar [lat,lon]
 * @param {Vector3} coord
 * @return {Array<Number>}
 */
export function cartesianToPolar(coord: Vector3) {
  if (!coord) throw Error("Coordinate not valid.");
  const lon = Math.atan2(coord.x, -coord.z) * RAD2DEG;
  const length = Math.sqrt(coord.x * coord.x + coord.z * coord.z);
  const lat = Math.atan2(coord.y, length) * RAD2DEG;

  return [lon, lat];
}
