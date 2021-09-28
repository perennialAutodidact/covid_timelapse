import React, { useState, useMemo, useCallback, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import { ColumnLayer } from "@deck.gl/layers";
import ReactMapGL from "react-map-gl";
import { DataFilterExtension } from "@deck.gl/extensions";
import TimelineSlider from "./TimelineSlider";
import { useSelector, useDispatch } from "react-redux";

import {
  COORDINATE_SYSTEM,
  _GlobeView as GlobeView,
  LightingEffect,
  AmbientLight,
  _SunLight as SunLight,
} from "@deck.gl/core";

import { GeoJsonLayer } from "@deck.gl/layers";
import { SimpleMeshLayer } from "@deck.gl/mesh-layers";

import { SphereGeometry } from "@luma.gl/core";
import { setLoadingStatus } from "../app/slices/covidSlice";
const EARTH_RADIUS_METERS = 6.3e6;

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 0.5,
});

const sunLight = new SunLight({
  color: [255, 255, 255],
  intensity: 2.0,
  timestamp: 0,
});

// create lighting effect with light sources
const lightingEffect = new LightingEffect({ ambientLight, sunLight });

const Map = ({ initialCoords }) => {
  const dispatch = useDispatch();
  const { loadingStatus, viewDate, data } = useSelector(
    (state) => state.covidData
  );

  // Viewport settings
  const INITIAL_VIEW_STATE = {
    longitude: initialCoords.longitude,
    latitude: initialCoords.latitude,
    zoom: -0.5,
    pitch: 0,
    bearing: 0,
  };

  const backgroundLayers = useMemo(
    () => [
      new SimpleMeshLayer({
        id: "earth-sphere",
        data: [0],
        mesh: new SphereGeometry({
          radius: EARTH_RADIUS_METERS,
          nlat: 18,
          nlong: 36,
        }),
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        getPosition: [0, 0, 0],
        getColor: [20, 20, 255],
      }),
      new GeoJsonLayer({
        id: "earth-land",
        data: "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_land.geojson",
        // Styles
        stroked: false,
        filled: true,
        getFillColor: [20, 85, 20],
      }),
    ],
    []
  );

  const getTooltip = ({ object }) => {
    if (object) {
      let html = "";
      let fields = [
        { title: "Country/Region", fieldName: "countryRegion" },
        { title: "Province/State", fieldName: "provinceState" },
        { title: "County", fieldName: "county" },
        { title: "Confirmed", fieldName: "confirmed" },
        { title: "Deaths", fieldName: "deaths" },
      ];

      fields.forEach((field) => {
        if (object[field.fieldName]) {
          html += `<div>${field.title}: ${object[field.fieldName]}</div>`;
        }

        if (field.fieldName === "county") {
          html += "<br/>";
        }
      });
      
      return {
        html,
        style: {
          textAlign: "left",
          borderRadius: "5px",
          padding: "15px",
        },
      };
    }
  };


  const columnLayer = new ColumnLayer({
    id: "confirmed-cases",
    data: data[viewDate],
    diskResolution: 12,
    pickable: true,
    extruded: true,
    elevationScale: 1,
    getFillColor: (d) => [255, 255 - d.confirmed / 255, 0],
    filled: true,
    radius: 40000,
    getFilterValue: (d) => d.confirmed > 0,
    filterRange: [0, 1],
    extensions: [new DataFilterExtension({filterSize: 1})],
    getPosition: (d) => {
      if (d.coordinates === undefined) {
        console.log("no coordinates:", d);
      }
      return [d.coordinates.longitude, d.coordinates.latitude];
    },
    getElevation: (d) => d.confirmed,
    transitions: {
      getElevation: {
        duration: 5000,
        // easing: d3.easeCubicInOut,
        enter: (to, from) => {
          console.log("from", from);
          return from;
        },
      },
    },
  });

  const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

  return (
    <>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[backgroundLayers, columnLayer]}
        views={new GlobeView()}
        parameters={{
          clearColor: [0, 0, 0, 1],
        }}
        getTooltip={getTooltip}
      >
        <TimelineSlider />
      </DeckGL>
    </>
    // {/* <ReactMapGL
    //   {...viewport}
    //   mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
    //   onViewportChange={setViewport}
    //   mapStyle="mapbox://styles/mapbox/dark-v10"
    // ></ReactMapGL> */}
  );
};

export default Map;
