import React, { useEffect, useState } from "react";
import { loadModules } from "esri-loader";

const Marker = (props) => {
  const [graphic, setGraphic] = useState(null);
  useEffect(() => {
    loadModules(["esri/Graphic", "esri/geometry/Circle", "esri/geometry/Point"])
      .then(([Graphic, Circle, Point]) => {
        const center = new Point([props.lat, props.lng]);
        // const circleGeometry = new Circle(center, { radius: 2000 });

        const circle = {
          type: 'point',
          color: [255,255,255,1],
          x: props.lat,
          y: props.lng
        }

        const fillSymbol = {
          type: "simple-marker",
          color: [255, 255, 255, 1],
          size: 200,
          outline: {
            color: [200, 200, 200, 1],
            width: 1,
          },
        };

        const graphic = new Graphic({
          geometry: circle,
          symbol: fillSymbol,
        });

        setGraphic(graphic);
        props.view.graphics.add(graphic);
      })
      .catch((err) => console.error(err));

    return () => props.view.graphics.remove(graphic);
  }, []);

  return null;
};

export default Marker;
