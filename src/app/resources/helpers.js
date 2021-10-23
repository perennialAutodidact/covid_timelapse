import dayjs from "dayjs";
import countryCoordinates from "./countryCoordinates";
import stateCoordinates from "./stateCoordinates";
/**
 * Create an object where the keys are dates and the values are arrays containing COVID
 * data for that date from around the world
 *
 * @param {string} _date Date string in format "MM-DD-YYYY"
 * @param {Object.<string, Object[]} _rawData
 * @returns object {'MM-DD-YYYY': [data objects]}
 */
export const scrubData = (_date, _rawData) => {
  const EXCLUDED_REGIONS = [
    "diamond princess",
    "grand princess",
    "cruise ship",
    "port quarantine",
    "ms zaandam",
    "summer olympics 2020",
    "recovered",
    "unknown",
    "others",
  ];

  const numberOfFields = Object.keys(_rawData[0]).length;
  let fieldNames = {
    countryRegion: null,
    provinceState: null,
    latitude: null,
    longitude: null,
  };
  // ACCOMODATE FOR DIFFERENT FIELD NAMES IN FIRST FEW CSV FILES
  if (numberOfFields <= 8) {
    fieldNames.countryRegion = "Country/Region";
    fieldNames.provinceState = "Province/State";
    fieldNames.latitude = "Latitude";
    fieldNames.longitude = "Longitude";
  } else {
    fieldNames.countryRegion = "Country_Region";
    fieldNames.provinceState = "Province_State";
    fieldNames.latitude = "Lat";
    fieldNames.longitude = "Long_";
  }

  let countryRegionFieldName = fieldNames.countryRegion;
  let provinceStateFieldName = fieldNames.provinceState;

  let newDateData = [];
  _rawData.forEach((datum) => {
    // if (!datum[countryRegionFieldName]) {
    //   console.log(countryRegionFieldName, datum);
    // }
    if (
      !EXCLUDED_REGIONS.includes(datum[countryRegionFieldName].toLowerCase())
    ) {
      let countryRegion = "";

      // DETERMINE THE COUNTRY/REGION NAME
      if (datum[countryRegionFieldName] === "US") {
        countryRegion = "United States";
      } else if (datum[countryRegionFieldName] === "UK") {
        countryRegion = "United Kingdom";
      } else if (datum[countryRegionFieldName] === "Taiwan*") {
        countryRegion = "Taiwan";
      } else if (datum[countryRegionFieldName] === "Mainland China") {
        countryRegion = "China";
      } else {
        countryRegion = datum[countryRegionFieldName].trim();
      }

      // PROVINCE/STATE NAME
      let provinceState = datum[provinceStateFieldName];

      if (provinceState !== null) {
        provinceState = provinceState.trim();
      }

      // DETERMINE COORDINATES FOR DATUM
      // IF LAT/LONG ARE EMPTY, ASSIGN VALUES
      // FOR STATE OR COUNTRY INSTEAD
      let coordinates;
      if (!datum.Lat || !datum.Long_) {
        // USE COORDINATES FOR STATE/PROVINCE, IF EXISTENT
        if (
          Object.keys(stateCoordinates).includes(datum[provinceStateFieldName])
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

      if (coordinates === undefined) {
        console.log(datum);
      }

      let county = datum.Admin2;

      newDateData.push({
        date: _date,
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
  let _data = newDateData;
  // console.log("scrubbed", _data);

  return _data;
};

/**
 * Return an array of date strings from startDate to endDate
 *
 * generateDateRange('09-17-2021', '10-17-2021') -> ['09-17-2021', '09-18-2021', ..., '10-16-2021', '10-17-2021']
 *
 * @param {string} startDate - Start of the date range. MM-DD-YYYY date format
 * @param {string} endDate - End of the date range. MM-DD-YYYY date format
 */
export const generateDateRange = (startDate, endDate) => {
  let dateRange = [];
  let currentDate = dayjs(startDate, "MM-DD-YYYY");

  while (currentDate.isBefore(endDate)) {
    dateRange.push(currentDate.format("MM-DD-YYYY"));
    currentDate = currentDate.add(1, "day");
  }

  return dateRange;
};
