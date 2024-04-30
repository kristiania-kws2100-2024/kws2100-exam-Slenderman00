import React, { MutableRefObject, useRef, useEffect, useState } from "react";
import { Map, View } from "ol";
import { OSM } from "ol/source";
import TileLayer from "ol/layer/Tile";
import {fromLonLat} from 'ol/proj.js';

import Vehicles from './vehicles.js';
import './Map.css'

const MapComponent: React.FC = () => {
  const mapRef = useRef() as MutableRefObject<HTMLDivElement>;
  const [_vehicles, setVehicles] = useState<Vehicles | null>(null);

  useEffect(() => {
    setVehicles(new Vehicles())

    let map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([10.757933, 59.911491]),
        zoom: 10,
      }),
    });

    return () => {
      //Makes sure it does not generate multiple maps
      map.setTarget();
    };
  }, [])

  return (
    <>
      <div
        ref={mapRef}
        className="map"
      />
    </>
  );
};

export default MapComponent;