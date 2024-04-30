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

/*
  Since entur has adapted subscriptions-transport-ws created in 2016 and mostly unmaintained since 2018 we are unable to get a response from the graphql subscriptions endpoint without rewriting the
  old client to work with newer versions of JS.

  So, instead we are going to constantly poll their servers like some sort of morons.
  This is not a decision that we take lightly.
*/


class Vehicles {
  constructor() {
    this.httpLink = new HttpLink({
      uri: "https://api.dev.entur.io/realtime/v1/vehicles/graphql",
    });

    this.client = new ApolloClient({
      link: this.httpLink,
      cache: new InMemoryCache(),
    });

    this.codespaces = [];
    this.vehicles = [];

    this.subscriber = new Subscriber('wss://api.dev.entur.io/realtime/v1/vehicles/subscriptions')


    this.fetchCodeSpaces().then((_codespaces) => {
      _codespaces.forEach((codespace) => {
        this.subscribeVehicles(codespace);
      });
    });
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

  async performSubscription(query, callback) {
    this.subscriber.subscribe(query, callback)
    //const observable = await this.client.subscribe({
    //  query: gql`subscription { ${query} }`,
    //});
//
    //const subscription = observable.subscribe({
    //  next(response) {
    //    if (callback && typeof callback === 'function') {
    //      callback(response.data);
    //    }
    //  },
    //  error(error) {
    //    console.error("Error during subscription:", error);
    //  },
    //  complete() {
    //    console.log("Subscription complete");
    //  }
    //});
//
    //return subscription;
  }

  async fetchCodeSpaces() {
    return this.performQuery(
    `
      codespaces {
          codespaceId
      }
    `
    ).then((data) => {
      console.log(data);
      data["codespaces"].forEach((codespace) => {
        this.codespaces.push(codespace["codespaceId"]);
      });

      return this.codespaces;
    });
  }

  async subscribeVehicles(codespace) {
    return this.performSubscription(
    `
    subscription {
        vehicles(codespaceId: "${codespace}") {
          line {lineRef}
          lastUpdated
          location {
            latitude
            longitude
          }
        }
      }
    `, (data) => {
      console.log(data)
    })
  }
}

export default Vehicles;
