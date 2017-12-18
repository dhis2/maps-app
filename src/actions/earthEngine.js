import * as types from '../constants/actionTypes';

// Set collection (periods) for one EE dataset
export const setEarthEngineCollection = (id, payload) => ({
  type: types.EARTH_ENGINE_COLLECTION_SET,
  id,
  payload,
});

// Load collection (periods) for one EE dataset
export const loadEarthEngineCollection = (id) => ({
  type: types.EARTH_ENGINE_COLLECTION_LOAD,
  id,
});