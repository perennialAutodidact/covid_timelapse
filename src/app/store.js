import { configureStore } from "@reduxjs/toolkit";
import covidReducer from "../app/slices/covidSlice";

const stateSanitizer = (state) => state.covidData.dataChunks ? { ...state.covidData, dataChunks: '<<LONG_BLOB>>' } : state.covidData
const actionSanitizer = (action) => (
  action.type === 'ADD_DATA_CHUNK' && action.data ?
  { ...action, data: '<<LONG_BLOB>>' } : action
);


export default configureStore({
  reducer: {
    covidData: covidReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
  }),
  devTools: {
    stateSanitizer: stateSanitizer,
    actionSanitizer: actionSanitizer
  }
});
