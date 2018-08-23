/**
 * @format
 */
/* eslint-disable react/prop-types */
import * as React from 'react';
import Route from 'react-router-dom/Route';
import Redirect from 'react-router-dom/Redirect';
import Switch from 'react-router-dom/Switch';
import { TemplateView, CreateTemplate, EditTemplate } from './Template/';
import { SimpleSearch, SearchResults, AdvancedBrowsing } from './Search/';
import { IndexList, DiacriticTable } from './Indexes/';
import TemplateForm from './Template/create/TemplateContainer';
import { ReportView } from './Report';
import { EmptyMessage } from './Core';

export function ConnectedRoute({ id, component: Component, ...props }) {
  return (
    <Route render={() => <Component {...props} id={id} />} />
  );
}

export default class Router extends React.Component<*> {
  render() {
    const rootPath = this.props.match.path;
    return (
      <Switch>
        <ConnectedRoute path={`${rootPath}/simpleSearch`} {...this.props} component={SimpleSearch} id="simple_search_nav_root" />
        <ConnectedRoute path={`${rootPath}/externalSearch`} {...this.props} component={EmptyMessage} id="external_search_nav_root" />
        <ConnectedRoute path={`${rootPath}/advancedSearch`} {...this.props} component={SearchResults} id="search_result_nav_root" />
        <ConnectedRoute path={`${rootPath}/report`} {...this.props} component={ReportView} id="index_list" />
        <ConnectedRoute path={`${rootPath}/templateAdd`} {...this.props} component={TemplateForm} id="template_create_nav_root" />
        <ConnectedRoute path={`${rootPath}/templateList`} {...this.props} component={TemplateView} id="template_list_nav_root" />
        <ConnectedRoute path={`${rootPath}/templateList/:{id}`} {...this.props} component={EditTemplate} id="template_list_nav_root" />
        <ConnectedRoute path={`${rootPath}/indexList`} {...this.props} component={IndexList} id="index_list_nav_root" />
        <ConnectedRoute path={`${rootPath}/diacritic`} {...this.props} component={DiacriticTable} id="diacritic_table_nav_root" />
        <ConnectedRoute path={`${rootPath}/browsing`} {...this.props} component={AdvancedBrowsing} id="browsing_search_nav_root" />
        <ConnectedRoute path={`${rootPath}`} {...this.props} component={EmptyMessage} id="nav_root" />
        <Route render={() => (<Redirect to={`${rootPath}`} id="nav_root_redirect" />)} />
      </Switch>
    );
  }
}
