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
		this.webSocket;
    this.url = url;
		this.query = ''
    this.subscriptions = {}
		this.queries = []

		this.initWebsocket()
  }

	initWebsocket() {
		this.webSocket = new WebSocket(this.url, "graphql-ws");

		this.webSocket.onopen = (event) => {
      this.webSocket.send(
        JSON.stringify({
          type: GRAPHQL_WS_PROTOCOL.CONNECTION_INIT
        })
      );
			this.renewSubscriptions()
    };

		this.webSocket.onclose = (event) => {
			this.initWebsocket()
		}

    this.webSocket.addEventListener("message", (event) => this.onMessage(event));
	}

  onMessage(event) {
		let data = JSON.parse(event.data);
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
				case GRAPHQL_WS_PROTOCOL.DATA: {
					this.subscriptions[data.id](data['payload']['data'])
				}
      }
  }

  subscribe(query, callback) {
    var id = Object.keys(this.subscriptions).length
    this.webSocket.send(JSON.stringify({"id": String(id),"type": GRAPHQL_WS_PROTOCOL.START,"payload": { "query": query } }))

    this.subscriptions[id] = callback
		this.queries.push({'id': id, 'query': query})
  }

	renewSubscriptions() {
		this.queries.forEach(query => {
			this.webSocket.send(JSON.stringify({"id": String(query['id']),"type": GRAPHQL_WS_PROTOCOL.START,"payload": { "query": query['query'] } }))
		});
	}
}


export default Subscriber;