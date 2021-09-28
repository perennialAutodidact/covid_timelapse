import "./App.css";

import { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import Map from "./components/Map";
import { getCSVData, addDatum, setLoadingState } from "./app/slices/covidSlice";
import { useSelector, useDispatch, connect } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";

import countryCoordinates from "./app/resources/countryCoordinates";
import stateCoordinates from "./app/resources/stateCoordinates";
import { CallMergeSharp } from "@mui/icons-material";

function App() {
  const dispatch = useDispatch();
  const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

  const [coords, setCoords] = useState({
    longitude: -96.4247,
    latitude: 10.51073,
  });
  useEffect(() => {}, [coords]);

  const { viewDate, data, loadingState, startDate, endDate } = useSelector(
    (state) => state.covidData
  );

  const scrubData = (raw) => {
    const EXCLUDED_REGIONS = [
      "diamond princess",
      "grand princess",
      "cruise ship",
      "port quarantine",
      "ms zaandam",
      "summer olympics 2020",
      "recovered",
      "unknown",
    ];

    console.log("raw", raw);
    const numberOfFields = Object.keys(raw[0]).length;
    let countryRegionFieldName, provinceStateFieldName;
    // ACCOMODATE FOR DIFFERENT FIELD NAMES IN FIRST FEW CSV FILES
    if (numberOfFields === 6) {
      countryRegionFieldName = "Country/Region";
      provinceStateFieldName = "Province/State";
    } else {
      countryRegionFieldName = "Country_Region";
      provinceStateFieldName = "Province_State";

    }

    let newDateObject = { date: viewDate, data: [] };
    raw.forEach((datum) => {
      if (
        !EXCLUDED_REGIONS.includes(datum[countryRegionFieldName].toLowerCase())
      ) {
        let countryRegion = "";

        // DETERMINE THE COUNTRY/REGION NAME
        if (datum[countryRegionFieldName] === "US") {
          countryRegion = "United States";
        } else if (datum[countryRegionFieldName] === "Taiwan*") {
          countryRegion = "Taiwan";
        } else if (datum[countryRegionFieldName] === "Mainland China") {
          countryRegion = "China";
        } else {
          countryRegion = datum[countryRegionFieldName];
        }

        // PROVINCE/STATE NAME
        let provinceState = datum[provinceStateFieldName];


        // DETERMINE COORDINATES FOR DATUM
        // IF LAT/LONG ARE EMPTY, ASSIGN VALUES
        // FOR STATE OR COUNTRY INSTEAD
        let coordinates;
        if (!datum.Lat || !datum.Long_) {
          // USE COORDINATES FOR STATE/PROVINCE, IF EXISTENT
          if (
            Object.keys(stateCoordinates).includes(
              datum[provinceStateFieldName]
            )
          ) {
            coordinates = stateCoordinates[datum[provinceStateFieldName]];
          } else {
            // USE COUNTRY/REGION FOR DATA WITH NO STATE/PROVINCE
            if (countryRegion === "South Korea") {
              coordinates = countryCoordinates["Korea, South"];
            } else {
              coordinates = countryCoordinates[countryRegion];
            }
          }
        } else {
          // IF DATUM HAS COORDINATES, USE THEM
          coordinates = { latitude: datum.Lat, longitude: datum.Long_ };
        }

        let county = datum.Admin2;

        newDateObject.data.push({
          countryRegion,
          provinceState,
          county,
          coordinates,
          confirmed: datum.Confirmed,
          deaths: datum.Deaths,
          active: datum.Active,
          recovered: datum.Recovered,
        });
      }
    });


    dispatch(addDatum(newDateObject));
    dispatch(
      setLoadingState({
        currentDate: dayjs(loadingState.currentDate, "MM-DD-YYYY")
          .add(1, "day")
          .format("MM-DD-YYYY"),
      })
    );
  };

  useEffect(() => {
    let { startDate, currentDate, endDate, totalFiles, fileCount } =
      loadingState;

    dispatch(
      setLoadingState({
        ...loadingState,
        totalFiles: totalFiles,
      })
    );

    // while (currentDate !== endDate) {
    dispatch(getCSVData(startDate))
      .then(unwrapResult)
      .then(scrubData)
      .catch((err) => console.log("err", err));
    // break
    // }
  }, []);

  const sizes = [20, 30, 40, 50, 60, 70, 80, 90, 100, 110];
  let animationRef = useRef();

  // const updateMarkers = () => {
  //   Object.keys(markers).map((key) => {
  //     if (markers[key].targetSize.index < sizes.length) {
  //       let marker = markers[key];
  //       setMarkers({
  //         ...markers,
  //         0: {
  //           ...marker,
  //             targetSize: {
  //             index: ++marker.index,
  //             size: sizes[marker.index + 1],
  //           },
  //         },
  //       });
  //     }
  //   });
  // };

  // useEffect(() => {
  //   let prevTime = 0;
  //   const changeSize = (currentTime) => {
  //     if (!prevTime || currentTime - prevTime >= 1000) {
  //       console.log(currentTime);
  //       prevTime = currentTime;
  //       updateMarkers();
  //     }
  //     animationRef.current = requestAnimationFrame(changeSize);
  //   };

  //   animationRef.current = requestAnimationFrame(changeSize);
  //   return () => cancelAnimationFrame(animationRef.current);
  // }, []);

  useEffect(() => {
    const graphics = [];
  }, []);

  return (
    <div className="App">
      {data && (
        <Map
          initialCoords={coords}
          accessToken={MAPBOX_ACCESS_TOKEN}
          data={data}
        />
      )}
    </div>
  );
}

export default connect()(App);
