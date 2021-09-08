import "./App.css";

import { Scene } from "@esri/react-arcgis";
import Marker from "./components/Marker";

function App() {
  return (
    <div className="App">
      <Scene
        style={{ width: "100vw", height: "100vh" }}
        mapProperties={{ basemap: "satellite" }}
        viewProperties={{
          center: [-122.4443, 47.2529],
          zoom: 6,
        }}
      >
        <Marker lat={-122.4443} lng={47.2529} />
      </Scene>
    </div>
  );
}

export default App;
