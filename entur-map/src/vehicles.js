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

class Vehicles {
  constructor() {
    this.httpLink = new HttpLink({
      uri: "https://api.dev.entur.io/realtime/v1/vehicles/graphql",
    });

    const wsClient = createClient({
      url: "wss://api.dev.entur.io/realtime/v1/vehicles/subscriptions",
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

    wsClient.on('connected', () => {
      console.log("yeeet")
      this.fetchCodeSpaces().then((_codespaces) => {
        _codespaces.forEach((codespace) => {
          this.subscribeVehicles(codespace);
        });
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
