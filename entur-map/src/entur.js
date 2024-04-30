import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  gql,
  split,
  HttpLink,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import Subscriber from "./subscriber";
import { Bus, VEHICLE_MODES } from "./vehicles";


class VehicleGroup {
  constructor(subscriber, codespace) {
    this.subscriber = subscriber
    this.codespace = codespace

    this.vehicles = {}

    this.subscribeVehicles(this.codespace, (data) => this.updateVehicles(data))
  }

  getVehiclePool() {
    _vehicles = []
    this.vehicles.forEach(vehicle => {
      _vehicles.push(vehicle)
    });

    return _vehicles
  }

  subscribeVehicles(codespace, callback) {
    return this.subscriber.subscribe(
    `
    subscription {
        vehicles(codespaceId: "${codespace}") {
          line {lineRef}
          lastUpdated
          bearing
          speed
          destinationName
          inCongestion
          mode
          vehicleId
          originName
          destinationRef
          originRef
          location {
            latitude
            longitude
          }
        }
      }
    `, (data) => {
      callback(data)
    })
  }

  createVehicle(data) {
    switch(data['mode']) {
      case(VEHICLE_MODES.AIR): {
        // console.log(VEHICLE_MODES.AIR)
        return new Bus(data)
      }
      case(VEHICLE_MODES.BUS): {
        // console.log(VEHICLE_MODES.BUS)
        return new Bus(data)
      }
      case(VEHICLE_MODES.COACH): {
        // console.log(VEHICLE_MODES.COACH)
        return new Bus(data)
      }
      case(VEHICLE_MODES.FERRY): {
        // console.log(VEHICLE_MODES.FERRY)
        return new Bus(data)
      }
      case(VEHICLE_MODES.METRO): {
        // console.log(VEHICLE_MODES.METRO)
        return new Bus(data)
      }
      case(VEHICLE_MODES.RAIL): {
        // console.log(VEHICLE_MODES.RAIL)
        return new Bus(data)
      }
      case(VEHICLE_MODES.TRAM): {
        // console.log(VEHICLE_MODES.TRAM)
        return new Bus(data)
      }
    }
  }

  updateVehicles(data) {
    data['vehicles'].forEach(vehicleData => {
      if(vehicleData['vehicleId'] in this.vehicles) {
        this.vehicles[vehicleData['vehicleId']].update(data)
      } else {
        this.vehicles[vehicleData['vehicleId']] = this.createVehicle(vehicleData)
      }
    });
  }
}

class Entur {
  constructor() {
    this.httpLink = new HttpLink({
      uri: "https://api.dev.entur.io/realtime/v1/vehicles/graphql",
    });

    this.client = new ApolloClient({
      link: this.httpLink,
      cache: new InMemoryCache(),
    });

    this.codespaces = [];
    this.vehicleGroups = [];

    this.subscriber = new Subscriber('wss://api.dev.entur.io/realtime/v1/vehicles/subscriptions')


    this.fetchCodeSpaces().then((_codespaces) => {
      _codespaces.forEach((codespace) => {
        this.vehicleGroups.push(new VehicleGroup(this.subscriber, codespace))
      });
    });
  }

  getVehiclePool() {
    vehicles = []
    this.vehicleGroups.forEach(vehicleGroup => {
      vehicles = vehicles.concat(vehicleGroup.getVehiclePool())
    });

    return vehicles
  }

  async performQuery(query) {
    try {
      const response = await this.client.query({
        query: gql`{${query}}`,
      });
      return response.data;
    } catch (error) {
      console.error("Error performing query:", error);
      throw error;
    }
  }

  async fetchCodeSpaces() {
    return this.performQuery(
    `
      codespaces {
          codespaceId
      }
    `
    ).then((data) => {
      data["codespaces"].forEach((codespace) => {
        this.codespaces.push(codespace["codespaceId"]);
      });

      return this.codespaces;
    });
  }
}

export default Entur;
