import { haversineDistance } from "./utils"

const VEHICLE_MODES = {
    AIR: 'AIR',
    RAIL: 'RAIL',
    TRAM: 'TRAM',
    COACH: 'COACH',
    BUS: 'BUS',
    FERRY: 'FERRY',
    METRO: 'METRO'
}

class Vehicle {
    constructor(data) {
        this.update(data)

        this.vehicleId
        this.location
        this.updated
        this.lastLocation
        this.lastUpdated

        this.bearing
        this.speed

        this.destinationName
        this.inCongestion

        this.originName
    }

    log() {
        console.log("Vehicle Data:");
        for (const property in this) {
            if (this.hasOwnProperty(property)) {
                console.log(`${property}: ${this[property]}`);
            }
        }

    }

    update(data) {
        this.vehicleId = data['vehicleId']
        this.lastLocation = this.location

        // { 'latitude': xxx, 'longitude': xxx }
        this.location = data['location']
        this.lastUpdated = this.updated
        this.updated = new Date(data['lastUpdated']).getTime() / 1000

        this.bearing = data['bearing'] ?? 0;
        this.speed = data['speed'] ?? this.calculateSpeed();
        this.destinationName = data['destinationName'] ?? 'Unknown';
        this.inCongestion = data['inCongestion'] ?? false;
        this.originName = data['originName'] ?? 'Unknown';
    }

    calculateSpeed() {
        if (this.lastLocation && this.lastUpdated) {
            const distance = haversineDistance(this.lastLocation, this.location);
            const time = this.updated - this.lastUpdated;
            if (time > 0) {
                console.log('calulated' + distance / time)
                return distance / time;
            } else {
                return 0
            }
        }

        return 0
    }
}

class Bus extends Vehicle {
    constructor(data) {
        super(data)
        this.log()
    }
}

export { VEHICLE_MODES, Vehicle, Bus }

