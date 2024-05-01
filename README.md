[x] Display moving data on a map using GrapQL data source. You can use Entur`s GraphQL vehicle data (not protobuf) or find a GraphQL websocket dataset on your own.

### When the zoom is closer than 10 the vehicles will animate instead of teleporting
### Due to enturs low polling rate it sometimes seems like everything is standing still
### Clicking on a vehicle will show the fylke the vehicle is in it will also show some other available interresting information if available

[The website can be found here](https://kristiania-kws2100-2024.github.io/kws2100-exam-Slenderman00/)

---
Notes: 

Since graphql-transport-ws has not been actively maintained since 2018 and entur implements the graphql-ws subprotocol (not to be confused with the framework with the same name) we had to implement our own graphql-ws subprotocol complient subscription manager. This subscription manager turned out great and it is the basis of the application.
The application also contains a vectorlayer of all the fylker that is used to lookup what fylke a vehicle is in.