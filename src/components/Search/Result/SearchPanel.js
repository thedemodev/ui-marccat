/**
 * @format
 * @flow
 */
import React from 'react';
import {
  SearchField,
  Button,
  AccordionSet,
  Accordion,
  FilterAccordionHeader,
  Row, Col,
  Icon,
  IconButton,
} from '@folio/stripes/components';
import { reduxForm, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { includes } from 'lodash';
import ResetButton from '../Filter/ResetButton';
import type { Props } from '../../../core';
import { SearchIndexes, SearchConditions, FiltersContainer } from '..';
import { ActionTypes } from '../../../redux/actions/Actions';
import { findYourQuery } from '../Filter';
import { remapFilters } from '../../../utils/Mapper';
import {
  getLanguageFilterQuery,
  getFormatFilterQuery,
} from '../../../utils/SearchUtils';
import { EMPTY_MESSAGE } from '../../../utils/Constant';
import OperatorSelect from '../Select/OperatorSelect';

import styles from '../index.css';

type P = Props & {
  inputErrorCheck: string,
  translate: Function,
}

class SearchPanel extends React.Component<P, {}> {
  constructor(props: P) {
    super(props);
    this.state = {
      isBrowseRequested: false,
      searchForm: [{ name: EMPTY_MESSAGE }],
      filterEnable: true,
      counter: [{}],
    };
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleAddSearchForm = this.handleAddSearchForm.bind(this);
    this.handleRemoveSearchForm = this.handleRemoveSearchForm.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.handleResetAllButton = this.handleResetAllButton.bind(this);
    this.transitionToParams = this.transitionToParams.bind(this);
  }

  transitionToParams = (key, value) => {
    const { location } = this.props;
    const url = location.pathname;
    return includes(url, `${key}=${value}`);
  };

  handleKeyDown(e) {
    let { isBrowseRequested } = this.state;
    if (e.charCode === 13 || e.key === 'Enter') {
      e.preventDefault();
      const { store, store: { getState }, dispatch, router } = this.props;
      store.dispatch({ type: ActionTypes.CLOSE_PANELS, closePanels: true });
      store.dispatch({ type: ActionTypes.CLOSE_ASSOCIATED_DETAILS, openPanel: false });
      const inputValue = '"' + e.target.form[2].defaultValue + '"';
      isBrowseRequested = false;
      let baseQuery;
      let indexForQuery;
      let conditionFilter;
      let indexFilter;
      const form = getState().form.searchForm;
      const state = getState();
      if (form.values) {
        if (form.values.selectIndexes) {
          indexFilter = form.values.selectIndexes;
        }
        if (form.values.selectCondition) {
          conditionFilter = form.values.selectCondition;
          indexForQuery = findYourQuery[indexFilter.concat('-').concat(conditionFilter)];
          baseQuery = indexForQuery + inputValue;
          baseQuery = (conditionFilter === 'MATCH') ? baseQuery + '!' : baseQuery;
        } else {
          baseQuery = inputValue;
        }
      } else {
        baseQuery = inputValue;
      }

      let bibQuery = baseQuery;
      const authQuery = baseQuery;
      this.transitionToParams('q', bibQuery);

      if (state.marccat.filter && state.marccat.filter.filters) {
        const { languageFilter, formatType } = remapFilters(state.marccat.filter.filters);
        if (languageFilter && languageFilter.length) {
          bibQuery += ' AND ( ' + getLanguageFilterQuery(languageFilter) + ' ) ';
        }
        if (formatType && formatType.length) {
          bibQuery += ' AND ( ' + getFormatFilterQuery(formatType) + ' ) ';
        }
      }
      if (conditionFilter === 'BROWSE') {
        isBrowseRequested = true;
        dispatch({ type: ActionTypes.BROWSE_FIRST_PAGE, query: bibQuery });
        router.push('/marccat/browse');
        this.transitionToParams('q', bibQuery);
        this.setState({
          filterEnable: false
        });
      } else if (!isBrowseRequested) {
        router.push('/marccat/search');
        this.setState({
          filterEnable: true
        });
        if (indexForQuery === 'BN '
          || indexForQuery === 'SN '
          || indexForQuery === 'PU '
          || indexForQuery === 'LL '
          || indexForQuery === 'BC '
          || indexForQuery === 'CP '
          || indexForQuery === 'PW ') {
          dispatch({ type: ActionTypes.SEARCH, queryBib: bibQuery, queryAuth: '' });
          this.transitionToParams('q', bibQuery);
        } else {
          dispatch({ type: ActionTypes.SEARCH, queryBib: bibQuery, queryAuth: authQuery });
          this.transitionToParams('q', authQuery);
        }
      }
    }
  }

  buildComplexQuery = () => {
  }

  handleAddSearchForm = () => {
    const { searchForm, counter } = this.state;
    this.setState({
      searchForm: searchForm.concat([{ name: '' }]),
      counter: counter.concat([{}]),
    });
  }

  handleRemoveSearchForm = idx => () => {
    const { searchForm } = this.state;
    delete searchForm[idx];
    this.setState({
      searchForm,
    });
  }

  handleOnChange = () => { };

  handleResetAllButton = () => {
    const { dispatch, reset } = this.props;
    dispatch({ type: ActionTypes.FILTERS, payload: {}, filterName: '', filterChecked: false });
    dispatch(reset('searchForm'));
    this.transitionToParams('filter', 'false');
  };

  renderResetButton = () => {
    return (
      <ResetButton
        className={styles['mb-5']}
        visible
        onClick={this.handleResetAllButton}
        id="clickable-reset-all"
        label={<FormattedMessage id="ui-marccat.button.resetAll" />}
      />
    );
  }


  render() {
    const { translate, ...rest } = this.props;
    const { searchForm, filterEnable, counter } = this.state;
    return (
      <React.Fragment>
        {this.renderResetButton()}
        <AccordionSet>
          <Accordion
            {...rest}
            separator={false}
            label={translate({ id: 'ui-marccat.navigator.search' })}
            header={FilterAccordionHeader}
          >
            {searchForm.map((form, idx) => (
              <form name="searchForm" onKeyDown={this.handleKeyDown} onChange={this.handleOnChange} key={idx}>
                <Row>
                  <Col xs={1}>
                    <div className={styles.leftBracket} />
                  </Col>
                  <Col xs={10} className={styles.forwardBracket}>
                    <Row>
                      <Col xs={12}>
                        <div className={styles.select_margin}>
                          <SearchIndexes
                            marginBottom0
                            {...this.props}
                          />
                        </div>
                      </Col>
                    </Row>
                    <Row style={{ height: '30px' }}>
                      <Col xs={12}>
                        <SearchConditions
                          {...this.props}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12}>
                        <div className={styles.select_margin}>
                          <Field
                            fullWidth
                            component={SearchField}
                            placeholder="Search..."
                            name="searchTextArea"
                            id="searchTextArea"
                          />
                        </div>
                      </Col>
                    </Row>
                    {idx !== (counter.length - 1) &&
                    <Row>
                      <Col xs={10}>
                        <OperatorSelect
                          {...this.props}
                          name="operatorSelect"
                          id="operatorSelect"
                        />
                      </Col>
                      <Col xs={2} style={{ display: 'flex', marginTop: '14px' }}>
                        <IconButton
                          icon="trash"
                          size="small"
                          onClick={this.handleRemoveSearchForm(idx)}
                        />
                      </Col>
                    </Row>
                    }
                    <Row>
                      <Col xs={12}>
                        <Button
                          buttonClass={styles.rightPosition}
                          onClick={this.handleAddSearchForm}
                        >
                          <Icon icon="plus-sign">
                            {translate({ id: 'ui-marccat.button.add' })}
                          </Icon>
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                  <Col xs={1}>
                    <div className={styles.rightBracket} />
                  </Col>
                </Row>
              </form>
            ))
            }
          </Accordion>
          <FiltersContainer {...this.props} filterEnable={!!(filterEnable)} />
        </AccordionSet>
      </React.Fragment>
    );
  }
}

export default reduxForm({
  form: 'searchForm',
  destroyOnUnmount: false
})(SearchPanel);
