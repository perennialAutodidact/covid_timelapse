import { compose, createStore } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import covidReducer from "../app/slices/covidSlice";
import { composeWithDevTools } from "redux-devtools-extension";


export default configureStore({
  reducer: {
    covidData: covidReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
  // middleware: getDefaultMiddleware => 
  //   getDefaultMiddleware({
  //     serializableCheck: false
  //   })
});
