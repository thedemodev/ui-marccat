import { combineReducers } from 'redux';
import { combineEpics } from 'redux-observable';
import {
  searchEngineReducer,
  filterReducer,
  getDetailsRecord,
  countDocReducer,
  getAssociatedBibRecord,
  scanBrowsingReducer,
  detailsAssociatedReducer,
  detailsBrowseSearchReducer,
  browseDetailsAssociatedReducer,
  templateViewReducer,
  lockRecordReducer,
  leaderReducer,
  headerTypes006Reducer,
  headerTypes007Reducer,
  headerTypes008Reducer,
  tag006ValuesReducer,
  tag007ValuesReducer,
  tag008ValuesReducer,
  headingByTagReducer,
  settingsReducer,
  panelsReducer,
} from './reducers/Reducer';
import {
  searchEpic,
  searchDetailEpic,
  countDocEpic,
  searchAssociatedBibRecords,
  associatedBibDetailEpic,
  scanBrowsingRecords,
  browseDetailEpic,
  browseAuthorityDetailEpic,
  browseDetailAssociatedEpic,
  templateViewEpic,
  leaderEpic,
  recordDetailEpic,
  templateByIdEpic,
  headerTypes006Epic,
  headerTypes007Epic,
  headerTypes008Epic,
  tag006ValuesEpic,
  tag007ValuesEpic,
  tag008ValuesEpic,
  headingSuggestionEpic,
} from './epic/epics';

export const reducer = combineReducers({
  search: searchEngineReducer,
  details: getDetailsRecord,
  filter: filterReducer,
  countDoc: countDocReducer,
  associatedRecords: getAssociatedBibRecord,
  associatedBibDetails: detailsAssociatedReducer,
  browse: scanBrowsingReducer,
  browseDetails: detailsBrowseSearchReducer,
  browseDetailsAssociated: browseDetailsAssociatedReducer,
  template: templateViewReducer,
  leaderData: leaderReducer,
  recordDetail: lockRecordReducer,
  headerTypes006: headerTypes006Reducer,
  headerTypes007: headerTypes007Reducer,
  headerTypes008: headerTypes008Reducer,
  tag006Values: tag006ValuesReducer,
  tag007Values: tag007ValuesReducer,
  tag008Values: tag008ValuesReducer,
  headingByTag: headingByTagReducer,
  settings: settingsReducer,
  panels: panelsReducer,
});

export const epics = combineEpics(
  searchEpic,
  searchDetailEpic,
  countDocEpic,
  searchAssociatedBibRecords,
  associatedBibDetailEpic,
  scanBrowsingRecords,
  browseDetailEpic,
  browseAuthorityDetailEpic,
  browseDetailAssociatedEpic,
  templateViewEpic,
  templateByIdEpic,
  leaderEpic,
  headerTypes006Epic,
  headerTypes007Epic,
  headerTypes008Epic,
  tag006ValuesEpic,
  tag007ValuesEpic,
  tag008ValuesEpic,
  recordDetailEpic,
  headingSuggestionEpic
);
