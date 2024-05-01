import React, { MutableRefObject, useRef, useEffect, useState } from "react";
import { Map, View } from "ol";
import { OSM } from "ol/source";
import TileLayer from "ol/layer/Tile";
import { fromLonLat } from "ol/proj.js";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";

import Entur from "./entur.js";
import "./Map.css";
import VectorLayer from "ol/layer/Vector.js";
import InfoComponent from "./infoComponent.jsx";
import getVectorLayer from "./openStreetMaps.js";

const MapComponent: React.FC = () => {
  const mapRef = useRef() as MutableRefObject<HTMLDivElement>;
  const [vectorSource] = useState(new VectorSource());
  const [infoBox, setInfoBox] = useState<JSX.Element>();

  useEffect(() => {
    let entur = new Entur();

    let vectorSourceFylker = new VectorSource({
      format: new GeoJSON(),
      url: "/kws2100-exam-Slenderman00/fylker.geojson",
      wrapX: false,
    });

    getVectorLayer().then((vectorLayer) => {
      let map = new Map({
        target: mapRef.current,
        layers: [
          new VectorLayer({
            source: vectorSourceFylker,
            visible: false,
          }),
          vectorLayer,
          new VectorLayer({
            source: vectorSource,
          }),
        ],
        view: new View({
          center: fromLonLat([10.757933, 59.911491]),
          zoom: 10,
        }),
      });

      setInterval(() => {
        entur.getVehiclePool().forEach((vehicle) => {
          vehicle.updatePoint(vectorSource, map);
        });
      }, 100);

      map.on("pointerdrag", (_) => setInfoBox(<></>));
      map.on("moveend", (_) => setInfoBox(<></>));

      let fylke: any;
      map.on("click", (event) => {
        let click = false;
        //get whole vehicle pool to extract data
        let vehicles = entur.getVehiclePool();
        fylke = null;
        map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
          if (layer && layer.getSource() === vectorSourceFylker) {
            fylke = feature.get("fylkesnavn");
          }

          vehicles.forEach((vehicle) => {
            if (vehicle.id == feature.getId()) {
              click = true;
              setInfoBox(<></>);
              setTimeout(() => {
                setInfoBox(
                  <InfoComponent
                    vehicle={vehicle}
                    event={event}
                    layer={layer}
                    fylke={fylke}
                  />
                );
              }, 50);
            }
          });
        });
        if (!click) {
          setInfoBox(<></>);
        }
      });
    });

    return () => {
      map.setTarget();
    };
  }, []);

  return (
    <>
      <div ref={mapRef} className="map" />
      {infoBox}
    </>
  );
};

export default MapComponent;
