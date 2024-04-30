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

/*
TODO: -> Note: Confusingly, the subscriptions-transport-ws library calls its WebSocket subprotocol graphql-ws, and the graphql-ws library calls its subprotocol graphql-transport-ws! In this article, we refer to the two libraries (subscriptions-transport-ws and graphql-ws), not the two subprotocols.
Who the fuck does this!?
*/


class Vehicles {
  constructor() {
    this.httpLink = new HttpLink({
      uri: "https://api.dev.entur.io/realtime/v1/vehicles/graphql",
    });

    const wsClient = createClient({
      url: "wss://api.dev.entur.io/realtime/v1/vehicles/subscriptions",
      webSocketImpl: class extends WebSocket {
        constructor(url, protocols) {
          super(url, 'graphql-ws');
        }
      }
    })

    this.wsLink = new GraphQLWsLink(wsClient);

    const splitLink = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      this.wsLink,
      this.httpLink
    );

    this.client = new ApolloClient({
      link: splitLink,
      cache: new InMemoryCache(),
    });

    this.codespaces = [];
    this.vehicles = [];


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
    const observable = await this.client.subscribe({
      query: gql`subscription { ${query} }`,
    });

    const subscription = observable.subscribe({
      next(response) {
        if (callback && typeof callback === 'function') {
          callback(response.data);
        }
      },
      error(error) {
        console.error("Error during subscription:", error);
      },
      complete() {
        console.log("Subscription complete");
      }
    });

    return subscription;
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
        vehicles(codespaceId:"${codespace}") {
          line {lineRef}
          lastUpdated
          location {
            latitude
            longitude
          }
        }
    `, (data) => {
      console.log(data)
    })
  }
}

export default Vehicles;
