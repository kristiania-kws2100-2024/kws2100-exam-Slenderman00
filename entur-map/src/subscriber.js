const GRAPHQL_WS_PROTOCOL = {
  CONNECTION_INIT: "connection_init",
  CONNECTION_ACK: "connection_ack",
  CONNECTION_ERROR: "connection_error",
  CONNECTION_KEEP_ALIVE: "ka",
  START: "start",
  STOP: "stop",
  CONNECTION_TERMINATE: "connection_terminate",
  DATA: "data",
  ERROR: "error",
  COMPLETE: "complete",
};

class Subscriber {
  constructor(url) {
    this.url = url;
    this.webSocket = new WebSocket(url, "graphql-ws");
    this.subscriptions = {}

    this.webSocket.onopen = (event) => {
      this.webSocket.send(
        JSON.stringify({
          type: GRAPHQL_WS_PROTOCOL.CONNECTION_INIT
        })
      );
    };

    this.webSocket.onMessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case GRAPHQL_WS_PROTOCOL.CONNECTION_ACK: {
          console.log("success");
          break;
        }
        case GRAPHQL_WS_PROTOCOL.CONNECTION_ERROR: {
          console.error(data.payload);
          break;
        }
        case GRAPHQL_WS_PROTOCOL.CONNECTION_KEEP_ALIVE: {
          break;
        }
      }
    };
  }

  subscribe(query, callback) {
    var id = Object.keys(this.subscriptions).length
    this.webSocket.send(JSON.stringify({"id": String(id),"type": GRAPHQL_WS_PROTOCOL.START,"payload": { "query": query } }))

    this.subscriptions[id] = callback
  }
}


export default Subscriber;