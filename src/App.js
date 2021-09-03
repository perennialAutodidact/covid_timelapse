import "./App.css";

import { Scene } from "@esri/react-arcgis";

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
      />
    </div>
  );
}

export default App;
