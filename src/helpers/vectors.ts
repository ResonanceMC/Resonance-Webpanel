// converted from https://gist.github.com/jhermsmeier/72626d5fd79c5875248fd2c1e8162489

const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface SphericalVector {
  lon: number;
  lat: number;
  radius: number;
}

/**
 * Convert [lat,lon] polar coordinates to [x,y,z] cartesian coordinates
 * @param {Number} lon
 * @param {Number} lat
 * @param {Number} radius
 * @return {Vector3}
 */
export function sphericalToCartesian({
  lon,
  lat,
  radius
}: SphericalVector): Vector3 {
  if (!lon || !lat || !radius) throw Error("Coordinate not valid.");

  const phi = (90 - lat) * DEG2RAD;
  const theta = (lon + 180) * DEG2RAD;

  return {
    x: -(radius * Math.sin(phi) * Math.sin(theta)),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.cos(theta)
  } as Vector3;
}

/**
 * Convert [x,y,z] cartesian coordinates to polar [lat,lon]
 * @param {Vector3} coord
 * @return {Array<Number>}
 */
export function cartesianToSpherical(coord: Vector3): SphericalVector {
  if (!coord) throw Error("Coordinate not valid.");
  const lon = Math.atan2(coord.x, -coord.z) * RAD2DEG;
  const radius = Math.sqrt(coord.x * coord.x + coord.z * coord.z);
  const lat = Math.atan2(coord.y, radius) * RAD2DEG;

  return { lon, lat, radius } as SphericalVector;
}
