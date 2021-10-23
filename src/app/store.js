import { configureStore } from "@reduxjs/toolkit";
import covidReducer from "../app/slices/covidSlice";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from 'redux-thunk';

// const stateSanitizer = (state) => state.covidData.data ? { ...state.covidData, data: '<<LONG_BLOB>>' } : state.covidData


export default configureStore({
  reducer: {
    covidData: covidReducer,
  },
  devTools: true,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
  }),
  
  // enhancers: defaultEnhancers => [stateSanitizer, ...defaultEnhancers],
  // middleware: getDefaultMiddleware => 
  //   getDefaultMiddleware({
  //     serializableCheck: false
  //   })
});
