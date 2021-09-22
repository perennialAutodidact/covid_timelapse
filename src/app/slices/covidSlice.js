import { createSlice } from "@reduxjs/toolkit";

export const covidSlice = createSlice({
  name: "covidData",
  initialState: {
    loadingStatus: "PENDING",
    viewDate: null,
    data: [
      // EXAMPLE DATA
      // {
      //   '01-22-2020': [
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
    ],
  },
  reducers: {
    addDatum: (state,action)=>{
      state.data.concat(action.payload)
    },
    setViewDate: (state, action) => {
      state.viewDate = action.payload
    }
  },
  extraReducers: {},
});

export const { addDatum, setViewState } = covidSlice.actions
export default covidSlice.reducer