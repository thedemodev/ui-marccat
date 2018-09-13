/* eslint-disable */
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { actionTypes as ActionTypes, reduxActionTypes } from '../actions/Actions';
import { ENDPOINT } from '../../Utils/Constant';
import { receiveLogicalView } from '../actions';

import {
  FETCH_WHISKIES,
  FETCH_WHISKIES_FAILURE,
  FETCH_WHISKIES_SUCCESS
} from '../actions';


// reducer handlers
const handlers = {};

/**
 * Helper for creating headers when making a request
 * @param {String} method - request method
 * @param {String} state.okapi.tenant - the Okapi tenant
 * @param {String} state.okapi.token - the Okapi user token
 * @returns {Object} headers for a new request
 */
const getHeaders = (method, { okapi }) => {
  const headers = {
    'X-Okapi-Tenant': okapi.tenant,
    'X-Okapi-Token': okapi.token
  };

  if (method === 'PUT' || method === 'POST') {
    headers['Content-Type'] = 'application/vnd.api+json';
  }

  return headers;
};

/**
 * Sometimes the response from the server (or mirage) does not include a
 * body (null). This causes `response.json()` to error with something like
 * "unexpected end of input". This workaround uses `response.text()` and
 * when there are any errors parsing it using `JSON.parse`, the text is
 * returned instead.
 */
const parseResponseBody = (response) => {
  return response.text().then((text) => {
    try { return JSON.parse(text); } catch (e) { return text; }
  });
};

/**
 * The main data store reducer simply uses the handlers defined above
 * @param {Object} state - data store state leaf
 * @param {Object} action - redux action being dispatched
 */
export function reducer(state = {}, action) {
  if (handlers[action.type]) {
    return handlers[action.type](state, action);
  } else {
    return state;
  }
}

export function search(actions$,{ getState }){
  return actions$
    .ofType(ActionTypes.FIND)
    .mergeMap(action => {
    
      const request = state.marccat.data[data.type].requests[data.timestamp];

      const promise = fetch(url)
        .then(response => Promise.all([response.ok, parseResponseBody(response)]))
        .then(([ok, body]) => (ok ? body : Promise.reject(body.errors))); // eslint-disable-line no-shadow

      // an observable from resolving or rejecting the request payload
      return Observable.from(promise)
        .map(responseBody => resolve(request, responseBody, payload))
        .catch(errors => Observable.of(reject(request, errors, data)));
      }
    );
  }
/**
 * The epic used to actually make a requests when an action is dispatched
 * @param {Observable} action$ - the observable action
 * @param {Function} store.getState - get's the most recent redux state
 */
export function epic(action$, { getState }) {
  const actionMethods = {
    [ActionTypes.QUERY]: 'GET',
    [ActionTypes.FIND]: 'GET',
    [ActionTypes.SAVE]: 'PUT',
    [ActionTypes.CREATE]: 'POST',
    [ActionTypes.DELETE]: 'DELETE'
  };

  return action$
    .filter(({ type }) => actionMethods[type])
    .mergeMap(({ type, data, payload }) => {
      const state = getState();
      const method = actionMethods[type];

      const request = state.marccat.data[data.type].requests[data.timestamp];


      // request which rejects when not OK
      const promise = fetch(url, { headers, method, body })
        .then(response => Promise.all([response.ok, parseResponseBody(response)]))
        .then(([ok, body]) => (ok ? body : Promise.reject(body.errors))); // eslint-disable-line no-shadow

      // an observable from resolving or rejecting the request payload
      return Observable.from(promise)
        .map(responseBody => resolve(request, responseBody, payload))
        .catch(errors => Observable.of(reject(request, errors, data)));
    });
}


const initialState = {
  whiskies: [],
  isLoading: false,
  error: null
};

export function rootReducer(state = initialState, action) {
  switch (action.type) {
      case FETCH_WHISKIES:
          return {
              ...state,
              // whenever we want to fetch the whiskies, set isLoading to true to show a spinner
              isLoading: true,
              error: null
          };
      case FETCH_WHISKIES_SUCCESS:
          return {
              whiskies: [...action.payload],
              // whenever the fetching finishes, we stop showing the spinner and then show the data
              isLoading: false,
              error: null
          };
      case FETCH_WHISKIES_FAILURE:
          return {
              whiskies: [],
              isLoading: false,
              // same as FETCH_WHISKIES_SUCCESS, but instead of data we will show an error message
              error: action.payload
          };
      default:
          return state;
  }
}
