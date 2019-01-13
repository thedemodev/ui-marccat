/**
 * @format
 * @flow
 */
import React from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import { Row, Col, Select, TextField } from '@folio/stripes/components';
import { injectCommonProp, Props } from '../../../../core';
import { ActionTypes } from '../../../../redux/actions';
import { decamelizify } from '../../Utils/MarcUtils';
import { SPACED_STRING } from '../../../../utils/Constant';
import style from '../../Style/style.css';

export class Tag006 extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isChangedHeaderType: false,
      cssStyle: false
    };
  }

  handleOnChange = (e) => {
    const { dispatch, leaderValue } = this.props;
    dispatch({ type: ActionTypes.VALUES_FROM_TAG_006, leader: leaderValue, code: '006', typeCode: e.target.value });
  }

  render() {
    const { headerTypesResult, tag006ValuesResults } = this.props;
    const { isChangedHeaderType, cssStyle } = this.state;
    const remappedValues = [];
    if (isChangedHeaderType && tag006ValuesResults) {
      const result = Object.keys(tag006ValuesResults.results).map((key) => tag006ValuesResults.results[key]);
      remappedValues.push(result);
    } if (headerTypesResult === undefined) {
      return <div />;
    } else {
      return (
        <React.Fragment>
          {headerTypesResult &&
          <div className={(cssStyle) ? style.leaderResultsActive : style.leaderResults}>
            <Row>
              <Col xs={4}>
                <Field
                  component={Select}
                  onChange={() => this.handleOnChange}
                  label="Header types"
                  placeholder="Select header..."
                  dataOptions={headerTypesResult.headingTypes}
                />
              </Col>
            </Row>
            <Row xs={12}>
              {
                (isChangedHeaderType === true && tag006ValuesResults) &&
                remappedValues.map(elem => {
                  return elem.map(item => {
                    let exactDisplayValue = '';
                    item.dropdownSelect.filter(x => (x.value === item.defaultValue ? exactDisplayValue = x.label : exactDisplayValue));
                    return (
                      <Col xs={4}>
                        <Field
                          name={`Tag006-${item.name}`}
                          id={`Tag006-${item.name}`}
                          label={decamelizify(`${item.name}`, SPACED_STRING)}
                          dataOptions={item.dropdownSelect}
                          placeholder={exactDisplayValue}
                        />
                      </Col>
                    );
                  });
                })
              }
              {!headerTypesResult &&
              <div className={(cssStyle) ? style.leaderResultsActive : style.leaderResults}>
                <Row>
                  <Col xs={4}>
                    <Field
                      component={TextField}
                      onChange={() => this.handleOnChange}
                      label="Header types"
                      placeholder="Select header..."
                      dataOptions={headerTypesResult.headingTypes}
                    />
                  </Col>
                </Row>
              </div>
              }
            </Row>
          </div>
          }
        </React.Fragment>
      );
    }
  }
}
export default (connect(
  ({ marccat: { template, headerTypes006, tag006Values } }) => ({
    leaderValue: template.recordsById.leader.value,
    headerTypesResult: headerTypes006.records,
    tag006ValuesResults: tag006Values.records
  }),
)(injectCommonProp(Tag006)));
