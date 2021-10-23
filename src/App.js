import "./App.css";

import { useEffect, useState, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import Map from "./components/Map";
import { getCSVData, addDataChunk } from "./app/slices/covidSlice";
import { useSelector, useDispatch } from "react-redux";

import { generateDateRange, scrubData } from "../src/app/resources/helpers";
import DeckGL from "@deck.gl/react";
import { ColumnLayer } from "@deck.gl/layers";
// import ReactMapGL from "react-map-gl";
import { DataFilterExtension } from "@deck.gl/extensions";
// import TimelineSlider from "./TimelineSlider";

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
import TimelineSlider from "./components/TimelineSlider";
import CountDates from "./components/CountDates";

import LoadDataTest from "./components/LoadDataTest";

function App() {
  const dispatch = useDispatch();

  const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
  const DATE_BLOCK_SIZE = 20; // number of days to load at a time

  const { startDate, dataChunks } = useSelector((state) => state.covidData);

  const [coords, setCoords] = useState({
    longitude: -96.4247,
    latitude: 10.51073,
  });

  const [state, setState] = useState({
    dateCount: 0,
    totalDays: dayjs()
      .subtract(1, "day")
      .diff(dayjs("01-22-2020", "MM-DD-YYYY"), "days"),
    startDate: "01-22-2020",
    endDate: dayjs().subtract(1, "day").format("MM-DD-YYYY"),
    lastLoadedDate: "02-10-2020", // for lazy loading
    viewDate: "01-22-2020",
  });

  const getEndDate = (_startDate) => {
    let _endDate = dayjs(_startDate, "MM-DD-YYYY").add(DATE_BLOCK_SIZE, "days");

    const yesterday = dayjs().subtract(1, "day");
    if (_endDate.isAfter(yesterday)) {
      _endDate = yesterday;
    }

    return _endDate;
  };

  const loadCSVs = (startDate) => {
    let _endDate = getEndDate(startDate);
    let dateRange = generateDateRange(startDate, _endDate);

    let promises = [];
    dateRange.map((date) => {
      promises.push(dispatch(getCSVData(date)));
    });

    Promise.all(promises)
      .then((results) => {
        let dataChunk = [];
        results.forEach((result) => {
          let _date = result.meta.arg;
          let _data = result.payload;
          dataChunk = dataChunk.concat(scrubData(_date, _data));
        });
        return dataChunk;
      })
      .then((dataChunk) => {
        dispatch(addDataChunk({ data: dataChunk, dateRange }));
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    loadCSVs(state.startDate);
  }, []);

  //
  // If the viewDate is within a certain number of days from the lastLoadedDate,
  // load the next set of <datagrid></datagrid>
  useEffect(() => {
    const diff = dayjs(state.viewDate, "MM-DD-YYYY").diff(
      dayjs(state.lastLoadedDate, "MM-DD-YYYY"),
      "days"
    );

    if (Math.abs(diff) < 10) {
      loadCSVs(state.viewDate);
      let newEndDate = getEndDate(state.lastLoadedDate)
        .subtract(1, "day")
        .format("MM-DD-YYYY");

      console.log("newEndDate", newEndDate);

      setState((state) => ({
        ...state,
        lastLoadedDate: newEndDate,
      }));
    }
  }, [state.viewDate, state.lastLoadedDate]);

  const setDateCount = useCallback((newCount) => {
    setState((state) => ({
      ...state,
      dateCount: newCount || state.dateCount++,
    }));
  }, []);

  useEffect(() => {
    setState({
      ...state,
      viewDate: dayjs(state.startDate, "MM-DD-YYYY")
        .add(state.dateCount, "days")
        .format("MM-DD-YYYY"),
    });
  }, [state.dateCount, state.startDate]);

  // Viewport settings
  const INITIAL_VIEW_STATE = {
    longitude: coords.longitude,
    latitude: coords.latitude,
    zoom: -0.5,
    pitch: 0,
    bearing: 0,
  };
  const EARTH_RADIUS_METERS = 6.3e6;

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

  // const fakeData = [
  //   [
  //     {
  //       date: "01-22-2021",
  //       countryRegion: "United States",
  //       coordinates: { latitude: 37.937575, longitude: -76.72920628 },
  //       confirmed: 1000000,
  //       testValue: .5
  //     },
  //     {
  //       date: "01-23-2021",
  //       countryRegion: "United States",
  //       coordinates: { latitude: 38.937575, longitude: -85.72920628 },
  //       confirmed: 1000000,
  //       testValue: 3
  //     },
  //   ],
  // ];

  // console.log(state.viewDate);
  // let isVisible = chunk.date === state.viewDate;
  const columnLayers = useMemo(()=>dataChunks.map((chunk) => {
    return new ColumnLayer({
      id: "confirmed-cases",
      data: chunk.data,
      diskResolution: 12,
      pickable: true,
      extruded: true,
      elevationScale: 1,
      // visible: false,
      getFillColor: (d) => [255, 255 - d.confirmed / 255, 0],
      filled: true,
      radius: 60000,
      getFilterValue: (d) => [
        // .5 is in the filterRange [0, 1] and will therefore get rendered. 10 will not.
        d.date === state.viewDate ? 0.5 : 10,
        d.confirmed !== null && d.confirmed > 0 ? .5 : 10,
      ],
      filterRange: [[0, 1], [0, 1]],
      extensions: [new DataFilterExtension({ filterSize: 2 })],
      updateTriggers: {
        getElevation: state.viewDate,
      },
      getPosition: (d) => {
        if (d.coordinates === undefined) {
          console.log("no coordinates:", d);
        } else {
          return [d.coordinates.longitude, d.coordinates.latitude];
        }
      },
      getElevation: (d) => d.confirmed,
      // transitions: {
      //   getElevation: {
      //     // enter: (to, from) => to,
      //     duration: 2000,
      //     // easing: d3.easeCubicInOut,
      //   },
      // },
    });
    console.log(columnLayers)
  }), [state.viewDate]);

  const getTooltip = ({ object }) => {
    if (object) {
      let html = "";
      let fields = [
        { title: "Date", fieldName: "date" },
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

  // console.log("mapData:", data);
  // console.log("viewDate:", state.viewDate);
  // console.log(`${state.viewDate} data:`, data);

  return (
    <>
      <div className="App">
        {dataChunks.length > 0 && (
          <>
            <TimelineSlider
              dateCount={state.dateCount}
              totalDays={state.totalDays}
              onChange={setDateCount}
              viewDate={state.viewDate}
            />
            <DeckGL
              initialViewState={INITIAL_VIEW_STATE}
              controller={true}
              layers={[backgroundLayers, columnLayers]}
              views={new GlobeView()}
              parameters={{
                clearColor: [0, 0, 0, 1],
              }}
              getTooltip={getTooltip}
            ></DeckGL>
          </>
        )}
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    // viewDate: state.covidData.viewDate,
    data: state.covidData.data,
    // startDate: state.covidData.startDate,
  };
};

export default App;
