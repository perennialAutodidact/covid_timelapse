import { configureStore } from '@reduxjs/toolkit';
import covidReducer from '../app/slices/covidSlice';

export default confitureStore({
  reducer: {
    covidData: covidReducer
  }
})
