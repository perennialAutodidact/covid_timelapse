import { scrubData } from '../helpers';
import { expose } from 'comlink';
import stateCoordinates from '../stateCoordinates';
import countryCoordinates from '../countryCoordinates';

const exports = {
  scrubData,
  stateCoordinates,
  countryCoordinates
}

expose(exports)