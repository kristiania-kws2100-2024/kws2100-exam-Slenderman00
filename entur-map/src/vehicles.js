import Point from "ol/geom/Point";
import { Icon, Style } from "ol/style";
import Feature from 'ol/Feature';
import { fromLonLat } from 'ol/proj';

import { haversineDistance, toRadians } from "./utils";
import { execute } from "graphql";

const VEHICLE_MODES = {
  AIR: "AIR",
  RAIL: "RAIL",
  TRAM: "TRAM",
  COACH: "COACH",
  BUS: "BUS",
  FERRY: "FERRY",
  METRO: "METRO",
};

class Vehicle {
  constructor(data) {
    this.update(data);

    this.point = null;

    this.id = Math.round((Math.random() * 999999) + 1)
    this.vehicleId;
    this.location;
    this.updated;
    this.lastLocation;
    this.lastUpdated;

    this.bearing;
    this.speed;

    this.destinationName;
    this.inCongestion;

    this.originName;
  }

  log() {
    console.log("Vehicle Data:");
    for (const property in this) {
      if (this.hasOwnProperty(property)) {
        console.log(`${property}: ${this[property]}`);
      }
    }
  }

  //we implement multiplexing into the new position
  updatePoint(vectorSource) {
    if(this.point != null) {
        //let point = vectorSource.getFeatureById(Number(this.id));
        let newPos = new Point(
            fromLonLat([this.lastLocation.longitude, this.lastLocation.latitude])
        )

        this.point.setStyle(
            new Style({
                image: new Icon({
                src: "/bus.png",
                scale: 0.05,
                rotation: toRadians(this.bearing - 90)
                }),
            })
        );
        
        this.point.setGeometry(newPos)
    

    }
    if(this.point == null) {
        this.createPoint(vectorSource)
    }
  }

  createPoint(vectorSource) {
    this.point = new Feature({
      geometry: new Point(
        fromLonLat([this.location.longitude, this.location.latitude])
      ),
    });

    this.point.setId(this.id)

    this.point.setStyle(
      new Style({
        image: new Icon({
          src: "/bus.png",
          scale: 0.03,
          rotation: toRadians(this.bearing - 90)
        }),
      })
    );

    vectorSource.addFeature(this.point)
  }

  update(data) {
    this.vehicleId = data["vehicleId"];
    this.lastLocation = this.location ?? { 'latitude': 0, 'longitude': 0 };

    this.location = data["location"] ?? { 'latitude': 0, 'longitude': 0 }; // We send everything that fails here
    this.lastUpdated = this.updated;
    this.updated = new Date(data["lastUpdated"]).getTime() / 1000;

    this.bearing = data["bearing"] ?? 0;
    this.speed = data["speed"] ?? this.calculateSpeed();
    this.destinationName = data["destinationName"] ?? "Unknown";
    this.inCongestion = data["inCongestion"] ?? false;
    this.originName = data["originName"] ?? "Unknown";
  }

  calculateSpeed() {
    if (this.lastLocation && this.lastUpdated) {
      const distance = haversineDistance(this.lastLocation, this.location);
      const time = this.updated - this.lastUpdated;
      if (time > 0) {
        return distance / time;
      } else {
        return 0;
      }
    }

    return 0;
  }
}

class Bus extends Vehicle {
  constructor(data) {
    super(data);
  }
}

export { VEHICLE_MODES, Vehicle, Bus };
