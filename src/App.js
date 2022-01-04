import './App.css'

import { useEffect, useState, useMemo, useCallback } from 'react'
import dayjs from 'dayjs'
// import worker from "./app/resources/worker";
// import WebWorker from "./app/resources/workerSetup";
import { getCSVData, addDataChunk } from './app/slices/covidSlice'
import { useDispatch, useSelector } from 'react-redux'

import { generateDateRange } from './app/resources/helpers'
import DeckGL from '@deck.gl/react'
import { ColumnLayer } from '@deck.gl/layers'
import { DataFilterExtension } from '@deck.gl/extensions'
import { useWorker } from './app/resources/webWorker/useScrubDataWorker'
import { COORDINATE_SYSTEM, _GlobeView as GlobeView } from '@deck.gl/core'

import { GeoJsonLayer } from '@deck.gl/layers'
import { SimpleMeshLayer } from '@deck.gl/mesh-layers'

import { SphereGeometry } from '@luma.gl/core'
import TimelineSlider from './components/TimelineSlider'

function App () {
  const dispatch = useDispatch()

  const DATE_BLOCK_SIZE = 100 // number of days to load at a time

  const dataChunks = useSelector(state => state.covidData.dataChunks)

  const [coords, setCoords] = useState({
    longitude: -96.4247,
    latitude: 10.51073
  })

  const [state, setState] = useState({
    dateCount: 0,
    totalDays: dayjs()
      .subtract(1, 'day')
      .diff(dayjs('04-12-2020', 'MM-DD-YYYY'), 'days'),
    startDate: '04-12-2020',
    endDate: dayjs()
      .subtract(1, 'day')
      .format('MM-DD-YYYY'),
    lastLoadedDate: dayjs('04-12-2020', 'MM-DD-YYYY')
      .add(DATE_BLOCK_SIZE, 'days')
      .format('MM-DD-YYYY'), // for lazy loading
    viewDate: '04-12-2020',
    isPlaying: false
  })

  // create web worker for handling raw CSV data
  const { workerApi, cleanup } = useWorker()

  const getEndDate = _startDate => {
    let _endDate
    if (dataChunks.length < 2) {
      _endDate = dayjs(_startDate, 'MM-DD-YYYY').add(DATE_BLOCK_SIZE, 'days')
    } else {
      _endDate = dayjs(_startDate, 'MM-DD-YYYY').add(100, 'days')
    }

    // if the calculated _endDate is past yesterday,
    // yesterday becomes the _endDate
    const yesterday = dayjs().subtract(1, 'day')
    if (_endDate.isAfter(yesterday)) {
      _endDate = yesterday
    }

    return _endDate
  }

  const loadCSVs = startDate => {
    let _endDate = getEndDate(startDate)
    let dateRange = generateDateRange(startDate, _endDate)

    let promises = []
    dateRange.map(date => {
      promises.push(dispatch(getCSVData(date)))
    })

    Promise.all(promises)
      .then(results => {
        return workerApi
          .scrubData(results)
          .then(res => res)
          .catch(err => console.log('err', err))
      })
      .then(dataChunk => {
        dispatch(addDataChunk({ data: dataChunk, dateRange }))
      })
      .catch(err => console.log(err))
  }

  useEffect(() => {
    loadCSVs('04-12-2020')
  }, [])

  //
  // If the viewDate is within a certain number of days from the lastLoadedDate,
  // load the next set of data
  useEffect(() => {
    const diff = dayjs(state.lastLoadedDate, 'MM-DD-YYYY').diff(
      dayjs(state.viewDate, 'MM-DD-YYYY'),
      'days'
    )

    let newEndDate, startDate

    if (diff < 0) {
      startDate = state.viewDate
    } else {
      startDate = state.lastLoadedDate
    }
    newEndDate = getEndDate(startDate).subtract(1, 'day')
    const endDateIsYesterday = newEndDate.isSame(dayjs().subtract(2, 'day'))

    if (endDateIsYesterday) {
      return
    }
    console.log('newEndDate', newEndDate)
    console.log('end', dayjs().subtract(1, 'day'))

    // distance from current viewDate to yesterday's date
    let distToYesterday = dayjs()
      .subtract(1, 'day')
      .diff(dayjs(newEndDate, 'MM-DD-YYYY'), 'days')

    if (Math.abs(diff) < 200 && distToYesterday >= 1) {
      console.log('diff', diff)
      console.log('distToYesterday', distToYesterday)
      console.log('endDateIsYesterday', endDateIsYesterday)
      
      if (diff > 0) {
        loadCSVs(state.lastLoadedDate)
        setState(state => ({
          ...state,
          lastLoadedDate: newEndDate.format('MM-DD-YYYY')
        }))
      }
    }
  }, [state.viewDate, state.lastLoadedDate, dataChunks])

  const setDateCount = useCallback(newCount => {
    setState(state => ({
      ...state,
      dateCount: newCount || state.dateCount++
    }))
  }, [])

  const setViewDate = useCallback(newViewDate => {
    setState(state => ({
      ...state,
      viewDate: newViewDate
    }))
  }, [])

  const toggleIsPlaying = useCallback(() => {
    setState(state => {
      return { ...state, isPlaying: !state.isPlaying }
    })
  }, [state.isPlaying])

  // Viewport settings
  const INITIAL_VIEW_STATE = {
    longitude: coords.longitude,
    latitude: coords.latitude,
    zoom: -0.5,
    pitch: 0,
    bearing: 0
  }
  const EARTH_RADIUS_METERS = 6.3e6

  const backgroundLayers = useMemo(
    () => [
      new SimpleMeshLayer({
        id: 'earth-sphere',
        data: [0],
        mesh: new SphereGeometry({
          radius: EARTH_RADIUS_METERS,
          nlat: 18,
          nlong: 36
        }),
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        getPosition: [0, 0, 0],
        getColor: [20, 20, 255]
      }),
      new GeoJsonLayer({
        id: 'earth-land',
        data:
          'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_land.geojson',
        // Styles
        stroked: false,
        filled: true,
        getFillColor: [20, 85, 20]
      })
    ],
    []
  )
  const columnLayers = useMemo(
    () =>
      dataChunks.map((chunk, i) => {
        let filteredData = chunk.data.filter(
          datum => datum[0].date === state.viewDate
        )
        let isVisible = chunk.dateRange.includes(state.viewDate)
        return new ColumnLayer({
          id: `cases-${i}`,
          data: filteredData[0], //chunk.data,
          diskResolution: 12,
          pickable: true,
          extruded: true,
          elevationScale: 1,
          visible: isVisible,
          getFillColor: d => [255, 255 - d.confirmed / 50 / 255, 0],
          filled: true,
          radius: 1500,
          coverage: 100,
          getFilterValue: d => [
            // d.isVisible,
            // .5 is in the filterRange [0, 1] and will therefore get rendered. 10 will not.
            // d.date === state.viewDate ? 0.5 : 10,
            d.confirmed !== null && d.confirmed > 0 ? 0.5 : 10
          ],
          filterRange: [
            // [0, 1],
            [0, 1]
          ],
          extensions: [new DataFilterExtension({ filterSize: 1 })],
          // updateTriggers: {
          //   getElevation: state.viewDate,
          // },
          getPosition: d => {
            if (d.coordinates === undefined) {
              // console.log("no coordinates:", d);
            } else {
              return [d.coordinates.longitude, d.coordinates.latitude]
            }
          },
          getElevation: d => d.confirmed
          // transitions: {
          //   getElevation: {
          //     // enter: (to, from) => to,
          //     duration: 2000,
          //     // easing: d3.easeCubicInOut,
          //   },
          // },
        })
      }),
    [state.viewDate]
  )

  const getTooltip = ({ object }) => {
    if (object) {
      let html = ''
      let fields = [
        { title: 'Date', fieldName: 'date' },
        { title: 'Country/Region', fieldName: 'countryRegion' },
        { title: 'Province/State', fieldName: 'provinceState' },
        { title: 'County', fieldName: 'county' },
        { title: 'Confirmed', fieldName: 'confirmed' },
        { title: 'Deaths', fieldName: 'deaths' }
      ]

      fields.forEach(field => {
        if (object[field.fieldName]) {
          html += `<div>${field.title}: ${object[field.fieldName]}</div>`
        }

        if (field.fieldName === 'county') {
          html += '<br/>'
        }
      })

      return {
        html,
        style: {
          textAlign: 'left',
          borderRadius: '5px',
          padding: '15px'
        }
      }
    }
  }

  return (
    <>
      <div className='App'>
        {dataChunks.length > 0 && (
          <>
            <TimelineSlider
              dateCount={state.dateCount}
              totalDays={state.totalDays}
              onChange={setDateCount}
              viewDate={state.viewDate}
              toggleIsPlaying={toggleIsPlaying}
              isPlaying={state.isPlaying}
              setViewDate={setViewDate}
            />
            <DeckGL
              // debug={true}
              initialViewState={INITIAL_VIEW_STATE}
              controller={true}
              layers={[backgroundLayers, columnLayers]}
              views={new GlobeView()}
              parameters={{
                clearColor: [0, 0, 0, 1]
              }}
              getTooltip={getTooltip}
              useDevicePixels={false}
              preventStyleDiffing={true}
            ></DeckGL>
          </>
        )}
      </div>
      
    </>
  )
}

export default App
