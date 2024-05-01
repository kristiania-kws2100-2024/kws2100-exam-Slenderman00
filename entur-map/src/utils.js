// https://en.wikipedia.org/wiki/Haversine_formula

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians) {
  return (radians * 180) / Math.PI;
}

function haversineDistance(coords1, coords2) {
  if (!coords1 || !coords2) {
    return 0;
  }

  const R = 6371e3;
  const lat1 = toRadians(coords1.latitude);
  const lat2 = toRadians(coords2.latitude);
  const deltaLat = toRadians(coords2.latitude - coords1.latitude);
  const deltaLon = toRadians(coords2.longitude - coords1.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function haversineBearing(coords1, coords2) {
  if (!coords1 || !coords2) {
    return 0;
  }

  const lat1 = toRadians(coords1.latitude);
  const lat2 = toRadians(coords2.latitude);
  const lon1 = toRadians(coords1.longitude);
  const lon2 = toRadians(coords2.longitude);

  const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  let bearing = Math.atan2(y, x);
  bearing = toDegrees(bearing);
  bearing = (bearing + 360) % 360;

  return bearing;
}

function getArrRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function simpleHash(str) {
  const len = str.length;
  const hashValue = ((len * 14352) % 100) / 100;

  return hashValue;
}

function getArrRandomDeterministic(array, seed) {
  return array[Math.floor(simpleHash(seed) * array.length)];
}

export {
  toRadians,
  haversineDistance,
  getArrRandom,
  haversineBearing,
  getArrRandomDeterministic,
};
