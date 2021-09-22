import "./App.css";

import { useEffect, useState, useRef } from "react";
import Map from "./components/Map";
import mapboxgl from "mapbox-gl";

function App() {
  const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
  const [markers, setMarkers] = useState({
    0: {
      lat: -125.4443,
      lng: 47.2529,
      currentSize: 10,
      targetSize: {
        size: 10,
        index: 0,
      },
    },
  });

  const [coords, setCoords] = useState({
    longitude: -125.4443,
    latitude: 47.2529,
  });
  useEffect(() => {}, [coords]);

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
      <Map
        initialCoords={{ longitude: -122.41669, latitude: 45.523064 }}
        accessToken={MAPBOX_ACCESS_TOKEN}
      />
    </div>
  );
}

export default App;
