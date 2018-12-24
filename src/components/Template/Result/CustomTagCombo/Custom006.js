/**
 * @format
 * @flow
 */
import React from 'react';
import { connect } from 'react-redux';
import { Row, Col, Icon, Selection } from '@folio/stripes/components';
import { injectCommonProp, Props } from '../../../../core';
import { ActionTypes } from '../../../../redux/actions';
import style from '../style.css';

type P = Props & {
}

export class Custom006 extends React.Component<P, {}> {
  constructor(props) {
    super(props);
    this.state = {
      isChangedHeaderType: false,
    };
  }

  handleOnChange = (e) => {
    const selectedHeaderType = e;
    const { dispatch, leaderValue } = this.props;
    dispatch({ type: ActionTypes.VALUES_FROM_TAG_006, leader: leaderValue, code: '006', typeCode: selectedHeaderType });
    this.state.isChangedHeaderType = true;
  }

  render() {
    const { headerTypesResult, tag006ValuesResults } = this.props;
    const { isChangedHeaderType } = this.state;
    const remappedValues = [];
    if (isChangedHeaderType && tag006ValuesResults) {
      const result = Object.keys(tag006ValuesResults.results).map((key) => tag006ValuesResults.results[key]);
      remappedValues.push(result);
    }
    if (headerTypesResult === undefined) {
      return <Icon icon="spinner-ellipsis" />;
    } else {
      return (
        <div className={style.rcornerspanel} id="rcornerspanel">
          <Row>
            <Col xs={4}>
              <Selection
                onChange={this.handleOnChange}
                label="Header types"
                placeholder="Select header..."
                dataOptions={headerTypesResult.headingTypes}
              />
            </Col>
          </Row>
          <hr />
          <Row xs={12}>
            {
              (isChangedHeaderType === true && tag006ValuesResults) &&
              remappedValues.map(elem => {
                const totInArray = elem.length;
                return elem.map(item => {
                  let exactDisplayValue = '';
                  item.dropdownSelect.filter(x => (x.value === item.defaultValue ? exactDisplayValue = x.label : exactDisplayValue));
                  return (
                    <Col xs={4}>
                      <Selection
                        label={item.name}
                        dataOptions={item.dropdownSelect}
                        placeholder={exactDisplayValue}
                      />
                    </Col>
                  );
                });
              })
            }
          </Row>
        </div>
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
)(injectCommonProp(Custom006)));