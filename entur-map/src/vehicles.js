import Point from "ol/geom/Point";
import { Icon, Style } from "ol/style";
import Feature from "ol/Feature";
import { fromLonLat } from "ol/proj";
import { containsCoordinate } from "ol/extent";

import {
  haversineDistance,
  toRadians,
  getArrRandom,
  haversineBearing,
} from "./utils";
import { execute } from "graphql";
import { none } from "ol/centerconstraint";

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

    this.lineName;

    this.id = Math.round(Math.random() * 999999 + 1);
    this.vehicleId;
    this.location;
    this.updated;
    this.lastLocation;
    this.lastUpdated;

    this.bearing;
    this.lastBearing;
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

  updatePoint(vectorSource, map) {
    if (
      this.point != null &&
      this.lastLocation.longitude != 0 &&
      this.lastLocation.latitude != 0 &&
      this.location.longitude != 0 &&
      this.location.latitude != 0
    ) {
      let oldPos = this.point.getGeometry().getCoordinates();
      let newPos = fromLonLat([
        this.lastLocation.longitude,
        this.lastLocation.latitude,
      ]);

      let extent = map.getView().calculateExtent(map.getSize());
      let zoom = map.getView().getZoom();

      if (containsCoordinate(extent, newPos) && zoom > 9) {
        // Calculate the distance and direction between old and new positions
        let dx = newPos[0] - oldPos[0];
        let dy = newPos[1] - oldPos[1];
        let distance = Math.sqrt(dx * dx + dy * dy);
        let direction = Math.atan2(dy, dx);

        // Define animation parameters
        let animationDuration = 1000;
        let startTime = null;

        // Define the animation function
        let animate = (timestamp) => {
          if (!startTime) startTime = timestamp;
          let progress = timestamp - startTime;
          let frac = Math.min(progress / animationDuration, 1); // Fraction of completion

          // Calculate the interpolated position
          let interpX = oldPos[0] + dx * frac;
          let interpY = oldPos[1] + dy * frac;
          let interpPos = [interpX, interpY];

          // Update the point position
          this.point.setGeometry(new Point(interpPos));

          // Continue the animation if not finished
          if (frac < 1) {
            requestAnimationFrame(animate);
          }
        };

        // Start the animation
        requestAnimationFrame(animate);
      } else {
        this.point.setGeometry(new Point(newPos));
      }

      this.point.setStyle(this.style);
    } else {
      this.createPoint(vectorSource);
    }
  }

  createPoint(vectorSource) {
    this.point = new Feature({
      geometry: new Point(
        fromLonLat([this.location.longitude, this.location.latitude])
      ),
    });

    this.point.setId(this.id);
    this.point.setStyle(this.style);
    vectorSource.addFeature(this.point);
  }

  update(data) {
    this.vehicleId = data["vehicleId"];

    this.lineName = data["line"]["lineName"];

    this.lastLocation = this.location ?? { latitude: 0, longitude: 0 };
    this.location = data["location"] ?? { latitude: 0, longitude: 0 }; // We send everything that fails here

    this.lastUpdated = this.updated;
    this.updated = new Date(data["lastUpdated"]).getTime() / 1000;

    this.lastBearing = this.bearing;
    this.bearing = data["bearing"] ?? 0;

    //if(data['speed'] != undefined) {
    //    this.speed = data['speed'] * (1000 / 3600)
    //}

    this.speed = data["speed"] ?? this.calculateSpeed();
    this.speed = Math.round(this.speed);

    //console.log(this.speed)
    this.destinationName = data["destinationName"];
    this.inCongestion = data["inCongestion"] ?? false;
    this.originName = data["originName"];
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

    this.style = new Style({
      image: new Icon({
        src: getArrRandom(["blue_bus.png", "yellow_bus.png"]),
        scale: 0.04,
        rotation: toRadians(this.bearing - 90),
      }),
    });
  }
}

class Train extends Vehicle {
  constructor(data) {
    super(data);

    this.style = new Style({
      image: new Icon({
        src: getArrRandom(["train_red.png", "train_grey.png"]),
        scale: 0.04,
        rotation: toRadians(this.bearing),
      }),
    });
  }
}

class Metro extends Vehicle {
  constructor(data) {
    super(data);

    this.style = new Style({
      image: new Icon({
        src: getArrRandom(["metro_dark.png", "metro_light.png"]),
        scale: 0.04,
        rotation: toRadians(this.bearing),
      }),
    });
  }
}

class Tram extends Vehicle {
  constructor(data) {
    super(data);

    this.style = new Style({
      image: new Icon({
        src: getArrRandom(["tram_dark.png", "tram_light.png"]),
        scale: 0.04,
        rotation: toRadians(this.bearing),
      }),
    });
  }
}

class Ferry extends Vehicle {
  constructor(data) {
    super(data);

    this.style = new Style({
      image: new Icon({
        src: "cruise.png",
        scale: 0.06,
        rotation: toRadians(this.bearing),
      }),
    });
  }
}

export { VEHICLE_MODES, Vehicle, Bus, Train, Metro, Tram, Ferry };
