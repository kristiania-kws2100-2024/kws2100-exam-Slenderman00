[x] Display moving data on a map using GrapQL data source. You can use Entur`s GraphQL vehicle data (not protobuf) or find a GraphQL websocket dataset on your own.

# Important
- When the zoom is closer than 10 the vehicles will animate instead of teleporting
- Due to enturs low polling rate it sometimes seems like everything is standing still
- Clicking on a vehicle will show the fylke the vehicle is in it will also show some other available interresting information if available
- Entur is usually quite slow when initially responding to all subscriptions so give the application some time to load in all vehicles (10s ish)
- It is worth noting that the entur class actually keeps track of all vehicles and moves them (instead of redrawing all points), the implementation is quite complex yet still efficient.

[The website can be found here](https://kristiania-kws2100-2024.github.io/kws2100-exam-Slenderman00/)

---
Notes: 

Since graphql-transport-ws has not been actively maintained since 2018 and entur implements the graphql-ws subprotocol (not to be confused with the framework with the same name) we had to implement our own graphql-ws subprotocol compliant subscription manager. This subscription manager turned out great and it is the basis of the application.
The application also contains a vectorlayer of all the fylker that is used to lookup what fylke a vehicle is in. Most of this is implemented in the `Entur` class and its subclasses `VehicleGroup`, `Vehicle`, `Bus`...

For our custom and interactive vector tiles we are using Open street maps vector tiles provided by the "OpenStreetMap Americana Community Vector Tile Server", Since it is free from commercial interests

A custom style has been written for the map that gives houses and parks different colors, this is intended to make the map a bit more playful. It is worth checking out the code for fetching the vector tiles found in `openStreetMaps.js` as the system implemented by the "Americana Community Vector Tile Server" is quite unique