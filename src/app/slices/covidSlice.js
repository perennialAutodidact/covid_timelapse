import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { load as loadCSV } from "@loaders.gl/core";
import { CSVLoader } from "@loaders.gl/csv";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

const BASE_URL =
  "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports";

export const getCSVData = createAsyncThunk(
  "covidData/getCSVData",
  // date: string - MM-DD-YYYY
  async (dateString, { rejectWithValue }) => {
    try {

      const response = await loadCSV(BASE_URL + `/${dateString}.csv`, CSVLoader);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const covidSlice = createSlice({
  name: "covidData",
  initialState: {
    loadingState: {
      status: 'PENDING',
      startDate: "09-25-2021", // date of first CSV file; 
      currentDate: "01-22-2020", // date of CSV currently loading
      endDate: dayjs().subtract(1,'day').format('MM-DD-YYYY'), // today, less one day (also known as yesterday)
      totalFiles: dayjs().subtract(1, 'day').diff(dayjs('01-22-2020', 'MM-DD-YYYY'), 'days'), // total number of CSV files (days from startDate til endDate)
      fileCount: 0
    },
    viewDate: "09-25-2021",
    rawData: [],
    data: {},
    // EXAMPLE DATA
    // {
    //   'MM-DD-YYYY': [
    //     {
    //       'country': '',
    //       'stateProvince': '',
    //       'cityCounty': '',
    //       'latitude': 0.0,
    //       'longitude': 0.0,
    //       'confirmed': 0,
    //       'deaths': 0,
    //       'recovered': 0,
    //       'active': 0,
    //     }
    //   ]
    // }
  },
  reducers: {
    addDatum: (state, action) => {
      state.data = {
        ...state.data,
        [action.payload.date]: action.payload.data,
      };
    },
    setViewDate: (state, action) => {
      state.viewDate = action.payload;
    },
    setLoadingState: (state, action) => {
      state.loading = {
        ...state.loading,
        ...action.payload
      };
    },
  },
  extraReducers: {
    [getCSVData.pending]: (state, action) => {
      // ... I'm sure something will go here eventually
    },
    [getCSVData.rejected]: (state, action) => {
      // ... I'm sure something will go here eventually
    },
    [getCSVData.fulfilled]: (state, action) => {
      state.rawData = action.payload;
    },
  },
});

export const { addDatum, setViewState, setLoadingState } = covidSlice.actions;
export default covidSlice.reducer;
