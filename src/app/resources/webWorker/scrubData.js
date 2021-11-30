import { expose } from 'comlink'
import countryCoordinates from '../countryCoordinates'
import stateCoordinates from '../stateCoordinates'
/**
 * Create an object where the keys are dates and the values are arrays containing COVID
 * data for that date from around the world
 *
 * @param {string} _date Date string in format "MM-DD-YYYY"
 * @param {Object.<string, Object[]} _rawData
 * @returns object {'MM-DD-YYYY': [data objects]}
 */
const scrubData = rawData => {
  const EXCLUDED_REGIONS = [
    'diamond princess',
    'grand princess',
    'cruise ship',
    'port quarantine',
    'ms zaandam',
    'summer olympics 2020',
    'recovered',
    'unknown',
    'others'
  ]
  let fieldNames = {
    countryRegion: null,
    provinceState: null,
    latitude: null,
    longitude: null
  }

  let dataChunk = []

  rawData.forEach(rawDatum => {
    let _date = rawDatum.meta.arg
    let _data = rawDatum.payload
    const numberOfFields = Object.keys(_data[0]).length
    // ACCOMODATE FOR DIFFERENT FIELD NAMES IN FIRST FEW CSV FILES
    if (numberOfFields <= 8) {
      fieldNames.countryRegion = 'Country/Region'
      fieldNames.provinceState = 'Province/State'
      fieldNames.latitude = 'Latitude'
      fieldNames.longitude = 'Longitude'
    } else {
      fieldNames.countryRegion = 'Country_Region'
      fieldNames.provinceState = 'Province_State'
      fieldNames.latitude = 'Lat'
      fieldNames.longitude = 'Long_'
    }

    let countryRegionFieldName = fieldNames.countryRegion
    let provinceStateFieldName = fieldNames.provinceState

    let newDateData = []
    _data.forEach(dataRow => {
      // if (!dataRow[countryRegionFieldName]) {
      //   console.log(countryRegionFieldName, dataRow);
      // }

      if (
        !EXCLUDED_REGIONS.includes(
          dataRow[countryRegionFieldName].toLowerCase()
        )
      ) {
        let countryRegion = ''

        // DETERMINE THE COUNTRY/REGION NAME
        switch (dataRow[countryRegionFieldName]) {
          case 'US':
            countryRegion = 'United States'
            break
          case 'UK':
            countryRegion = 'United Kingdom'
            break
          case 'Taiwan*':
            countryRegion = 'Taiwan'
            break
          case 'Mainland China':
            countryRegion = 'China'
            break
          case 'Iran (Islamic Republic of)':
            countryRegion = 'Iran'
            break
          default:
            countryRegion = dataRow[countryRegionFieldName].trim()
        }

        // PROVINCE/STATE NAME
        let provinceState = dataRow[provinceStateFieldName]

        if (provinceState !== null) {
          provinceState = provinceState.trim()
        }

        // DETERMINE COORDINATES FOR DATUM
        // IF LAT/LONG ARE EMPTY, ASSIGN VALUES
        // FOR STATE OR COUNTRY INSTEAD
        let coordinates
        if (!dataRow.Lat || !dataRow.Long_) {
          // USE COORDINATES FOR STATE/PROVINCE, IF EXISTENT
          if (
            Object.keys(stateCoordinates).includes(
              dataRow[provinceStateFieldName]
            )
          ) {
            coordinates = stateCoordinates[dataRow[provinceStateFieldName]]
          } else {
            // USE COUNTRY/REGION FOR DATA WITH NO STATE/PROVINCE
            if (countryRegion === 'South Korea') {
              coordinates = countryCoordinates['Korea, South']
            } else {
              coordinates = countryCoordinates[countryRegion]
            }
          }
        } else {
          // IF DATUM HAS COORDINATES, USE THEM
          coordinates = { latitude: dataRow.Lat, longitude: dataRow.Long_ }
        }

        // if (coordinates === undefined) {
        //   console.log(dataRow);
        // }

        let county = dataRow.Admin2

        newDateData.push({
          date: _date,
          countryRegion,
          provinceState,
          county,
          coordinates,
          confirmed: dataRow.Confirmed,
          deaths: dataRow.Deaths,
          active: dataRow.Active,
          recovered: dataRow.Recovered
        })
      }
    })

    dataChunk.push(newDateData)
  })
  return dataChunk
}

expose({
  countryCoordinates,
  stateCoordinates,
  scrubData
})
