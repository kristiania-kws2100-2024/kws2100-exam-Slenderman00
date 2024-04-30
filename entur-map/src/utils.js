
// https://en.wikipedia.org/wiki/Haversine_formula

function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

function haversineDistance(coords1, coords2) {
    if(!coords1 || !coords2) {
        return 0
    }

    const R = 6371e3; // meters
    const lat1 = toRadians(coords1.latitude);
    const lat2 = toRadians(coords2.latitude);
    const deltaLat = toRadians(coords2.latitude - coords1.latitude);
    const deltaLon = toRadians(coords2.longitude - coords1.longitude);

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function getArrRandom(array) {
    return array[Math.floor(Math.random() * array.length)]
}

export { toRadians, haversineDistance, getArrRandom }