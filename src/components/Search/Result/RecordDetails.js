import React from 'react';
import { connect } from 'react-redux';
import { KeyValue, Row, Col, AccordionSet, FilterAccordionHeader, Accordion } from '@folio/stripes-components';
import InventoryPluggableBtn from '../Button/Inventory';
import type { Props } from '../../../core';
import { getTag245, getTitle245, getTag100, getTitle100 } from '../../../utils/Mapper';
import AssociatedBib from './AssociatedBib';
import { EMPTY_MESSAGE } from '../../../utils/Constant';

import style from '../../../styles/common.css';


type P = Props & {
  items: Array<any>,
}

function RecordDetails({ translate, ...props }: P) {
  const { items, checkDetailsInRow, checkDetailsBibRec } = props;
  const recordDetails = items.replace('LEADER', '000');
  const recordDetailsArray = recordDetails.split('\n');
  const tag245 = getTag245(recordDetailsArray);
  const title245 = getTitle245(recordDetailsArray);
  return (
    <AccordionSet>
      <Accordion
        separator={false}
        header={FilterAccordionHeader}
        label={checkDetailsInRow !== checkDetailsBibRec ? translate({ id: 'ui-marccat.search.details.bibliographic' }) : translate({ id: 'ui-marccat.search.details.authority' })}
      >
        <div className={style.withSpace}>
          <KeyValue
            label={tag245 === EMPTY_MESSAGE ? getTag100(recordDetailsArray) : tag245 + 'Title'}
            value={title245 === EMPTY_MESSAGE ? getTitle100(recordDetailsArray) : title245}
          />
          {recordDetailsArray.map((item, i) => (
            <Row key={i}>
              <Col xs={1} className={style.padding8}>
                {item.trim().substring(0, 3)}
              </Col>
              <Col xs={1} className={style.padding8}>
                {item.substring(6).startsWith('$') ? item.substring(3, 6) : ''}
              </Col>
              <Col xs={10} className={style.padding8}>
                {!item.substring(6).startsWith('$') ? item.substring(3) : item.substring(6)}
              </Col>
            </Row>
          ))}
        </div>
        <InventoryPluggableBtn {...props} buttonLabel={translate({ id: 'ui-marccat.search.goto.inventory' })} />
      </Accordion>
      {checkDetailsBibRec === checkDetailsInRow &&
      <AssociatedBib {...props} />}
    </AccordionSet>
  );
}

export default (connect(
  ({ marccat: { details, associatedRecords } }) => ({
    items: details.records,
    checkDetailsInRow: details.recordType,
    checkDetailsBibRec: associatedRecords.recordType
  })
)(RecordDetails));
