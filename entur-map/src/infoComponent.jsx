import React, { useState, useRef, useEffect } from "react";
import "./infoBox.css";

const DestComp = (props) => {
  if (!props.origin && !props.destination) {
    return <></>;
  }
  return (
    <div id="destination">
      {(props.origin ?? "UNKOWN").toUpperCase()}
      &nbsp;&nbsp;&nbsp;&nbsp;➤&nbsp;&nbsp;&nbsp;&nbsp;
      {(props.destination ?? "UNKNOWN").toUpperCase()}
    </div>
  );
};

const SpeedComp = (props) => {
  if (!props.speed) {
    return <></>;
  }
  return <div id="speed">{props.speed}</div>;
};

const LineNameComp = (props) => {
  if (!props.lineName) {
    return <></>;
  }
  return <div id="lineName">{props.lineName}</div>;
};

const FylkeComp = (props) => {
  if (!props.fylke) {
    return <></>;
  }
  return <div id="fylke">{props.fylke}</div>;
};

const InfoComponent = (props) => {
  const [infoHeight, setInfoHeight] = useState(0);
  const infoRef = useRef(null);

  useEffect(() => {
    // Update height when the component mounts or props change
    setInfoHeight(infoRef.current.clientHeight);
  }, [props]);

  return (
    <div
      ref={infoRef}
      className="onMapBox"
      style={{
        top: props.event.pixel[1] - 20 - infoHeight + "px",
        left: props.event.pixel[0] - 200 + "px",
      }}
    >
      <LineNameComp lineName={props.vehicle.lineName} />
      <DestComp
        origin={props.vehicle.originName}
        destination={props.vehicle.destinationName}
      />
      <SpeedComp speed={props.vehicle.speed}></SpeedComp>
      <FylkeComp fylke={props.fylke}></FylkeComp>
      <div id="borderBottom"></div>
    </div>
  );
};

export default InfoComponent;
