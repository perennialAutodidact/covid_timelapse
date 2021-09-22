import React, { useState } from "react";
import DeckGL from "@deck.gl/react";
import { ColumnLayer } from "@deck.gl/layers";
import ReactMapGL, { NavigationControl } from "react-map-gl";


const Map = ({data, initialCoords}) => {
  // Viewport settings
  const INITIAL_VIEW_STATE = {
    longitude: initialCoords.longitude,
    latitude: initialCoords.latitude,
    zoom: 13,
    pitch: 45,
    bearing: 0,
  };
  // // Data to be used by the LineLayer
  // const data = [
  //   {
  //     centroid: [-122.41669, 45.523064],
  //     value: .5
  //   },
  //   // {
  //   //   centroid: [-122.41669, 45.523064],
  //   //   value: .5
  //   // },
  //   // {
  //   //   centroid: [-122.41669, 45.523064],
  //   //   value: .5
  //   // },
  //   // {
  //   //   centroid: [-122.41669, 45.523064],
  //   //   value: .5
  //   // },
  //   // {
  //   //   centroid: [-122.41669, 45.523064],
  //   //   value: .5
  //   // },
  // ];

  const [viewport, setViewport] = useState({
    longitude: -122.41669,
    latitude: 45.523064,
    zoom: 12,
  });

  const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

  const layers = [
    new ColumnLayer({
      id: "active-cases",
      data,
      diskResolution: 12,
      pickable: true,
      extruded: true,
      elevationScale: 5000,
      getLineColor: [255,0,0, 255],
      getFillColor: [200,0,0],
      filled: true,
      radius: 100,
      getPosition: (d) => d.centroid,
      getElevation: d => d.value
    }),
  ];

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
    >
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        onViewportChange={setViewport}
        mapStyle="mapbox://styles/mapbox/dark-v10"
      ></ReactMapGL>
    </DeckGL>
  );
};

export default Map;
