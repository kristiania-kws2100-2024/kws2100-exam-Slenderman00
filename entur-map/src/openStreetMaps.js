import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import MVT from "ol/format/MVT";
import { Style, Stroke, Fill, Text } from "ol/style";
import { compose } from "ol/transform";

import { getArrRandomDeterministic, getArrRandom } from "./utils";

function getTileJsonData(callback) {
  const URL = "https://tile.ourmap.us/data/v3.json";
  return fetch(URL).then((response) => response.json());
}

function featureSwitch(feature) {
  const properties = feature.getProperties();
  const layer = properties.layer;

  console.log(layer);

  switch (layer) {
    case "transportation": {
      return new Style({
        stroke: new Stroke({
          color: "#da65f9",
          width: 1,
        }),
      });
    }
    case "building": {
      if (!properties.color) {
        properties.color = getArrRandom([
          "#f6c348",
          "#40e7b9",
          "#da65f9",
          "#ea4f5e",
        ]);
      }
      return new Style({
        fill: new Fill({
          color: properties.color,
        }),
      });
    }
    case "water": {
      return new Style({
        fill: new Fill({
          color: "#14a9ff",
        }),
        stroke: new Stroke({
          color: "#14a9ff",
          width: 1,
        }),
      });
    }
    case "landcover":
    case "landuse":
    case "place":
    case "landuse":
    case "park": {
      return new Style({
        fill: new Fill({
          color: getArrRandomDeterministic(
            [
              "#ffb366",
              "#95e9b1",
              "#80e5a2",
              "#6be192",
              "#56dc83",
              "#41d873",
              "#2bd463",
              "#27be5a",
              "#23a950",
              "#1e9446",
              "#1a7f3c",
            ],
            properties.name ?? properties.layer
          ),
        }),
      });
    }
    case "mountain_peak": {
      return new Style({
        fill: new Fill({
          color: "#fffff2",
        }),
      });
    }
    default: {
      return new Style({
        fill: new Fill({
          color: "#22a74e",
        }),
      });
    }
  }
}

async function getVectorLayer() {
  const data = await getTileJsonData();

  return new VectorTileLayer({
    source: new VectorTileSource({
      format: new MVT(),
      url: data["tiles"][0],
      attributions: "OpenStreetMap & OpenMapTiles",
    }),
    style: featureSwitch,
  });
}

export default getVectorLayer;
