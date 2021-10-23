import React, { useEffect } from "react";
import dayjs from "dayjs";
import { CSVLoader } from "@loaders.gl/csv";
import DeckGL from "@emotion/react";
import { ColumnLayer } from "@deck.gl/layers";
import { generateDateRange, scrubData } from "../app/resources/helpers";
import { addDataChunk, getCSVData } from "../app/slices/covidSlice";
import { useSelector, useDispatch } from "react-redux";

const getEndDate = (_startDate) => {
  let _endDate = dayjs(_startDate, "MM-DD-YYYY").add(20, "days");

  const yesterday = dayjs().subtract(1, "day");
  if (_endDate.isAfter(yesterday)) {
    _endDate = yesterday;
  }

  return _endDate;
};

const LoadDataTest = () => {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.covidData);

  function loadCSVs(startDate) {
    let _endDate = getEndDate(startDate);
    let dateRange = generateDateRange(startDate, _endDate);

    let promises = [];
    dateRange.map((date) => {
      promises.push(dispatch(getCSVData(date)));
    });

    Promise.all(promises)
      .then((results) => {
        const dataChunk = [];
        results.forEach((result) => {
          let _date = result.meta.arg;
          let _data = result.payload;
          dataChunk.push(scrubData(_date, _data));
        });
        return dataChunk
      })
      .then(dataChunk=>{
        dispatch(addDataChunk(dataChunk))
      })
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    loadCSVs("09-17-2020");
  }, []);

  return <div></div>;
};

export default LoadDataTest;
