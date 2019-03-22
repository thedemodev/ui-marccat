/* eslint-disable quotes */
/**
 * @format
 * @flow
 */
import React from 'react';
import { connect } from 'react-redux';
import {
  Pane,
  Paneset,
  AccordionSet,
  Callout,
  Row,
  PaneMenu,
  Button,
  Accordion,
  KeyValue,
  Icon
} from '@folio/stripes/components';
import { AppIcon } from '@folio/stripes-core';
import { reduxForm } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { isEmpty, union, sortBy, includes } from 'lodash';
import type { Props } from '../../core';
import { ActionMenuTemplate, SingleCheckboxIconButton } from '../../lib';
import { VariableFields, MarcLeader, FixedFields } from '.';
import { ActionTypes } from '../../redux/actions/Actions';
import { post, put } from '../../core/api/HttpService';
import * as C from '../../shared/Constants';

import { RECORD_FIELD_STATUS, TAG_WITH_NO_HEADING_ASSOCIATED, SUBFIELD_DELIMITER } from './Utils/MarcUtils';
import style from './Style/style.css';
import { headingAction, headingDeleteAction, settingsAction } from './Actions/MarcActionCreator';
import { buildUrl } from '../../shared/Function';


type P = {
  callout: Object,
} & Props;

export class CreateMarcRecord extends React.Component<P, {}> {
  constructor(props: P) {
    super(props);
    this.renderDropdownLabels = this.renderDropdownLabels.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.saveRecord = this.saveRecord.bind(this);
    this.callout = React.createRef();
    this.onSave = this.onSave.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.onCreate = this.onCreate.bind(this);
    this.onDelete = this.onDelete.bind(this);

    props.dispatch(settingsAction({ fromCataloging: true }));
  }

  onSave = () => {}

  editHeading = item => {
    const { store: { getState } } = this.props;
    const tagVariableData = getState().form.marcEditableListForm.values.items;
    const tagSelected = tagVariableData.filter(t => t.code === item.code)[0];
    const displayValue = item.displayValue.replace('$', SUBFIELD_DELIMITER);
    const heading = {
      indicator1: item.ind1 || tagSelected.variableField.ind1,
      indicator2: item.ind2 || tagSelected.variableField.ind2,
      stringText: displayValue,
      category: item.categoryCode || tagSelected.variableField.categoryCode,
      headingNumber: (item.code === '040') ? 123456 : item.keyNumber || (item.code === '040') ? 0 : tagSelected.variableField.keyNumber,
      tag: item.code || tagSelected.code,
    };
    put(buildUrl(C.ENDPOINT.UPDATE_HEADING_URL, C.ENDPOINT.DEFAULT_LANG_VIEW), heading)
      .then((r) => {
        return r.json();
      }).then((data) => {
        tagVariableData.filter(t => t.code === item.code).map(k => {
          k.fieldStatus = RECORD_FIELD_STATUS.CHANGED;
          k.variableField = {
            ind1: data.indicator1 || C.SPACED_STRING_DOUBLE_QUOTE,
            ind2: data.indicator2 || C.SPACED_STRING_DOUBLE_QUOTE,
            oldKeyNumber: k.variableField.keyNumber,
            displayValue: data.stringText,
            keyNumber: data.headingNumber,
          };
          return k;
        });
      });
  }

  createNewHeading = (item) => {
    const { dispatch, emptyRecord } = this.props;
    const displayValue = item.displayValue.replace('$', SUBFIELD_DELIMITER);
    const heading = {
      indicator1: item.ind1 || C.EMPTY_STRING,
      indicator2: item.ind2 || C.EMPTY_STRING,
      stringText: displayValue,
      tag: item.code
    };
    const id = emptyRecord.id;
    dispatch(headingAction(id, heading));
  };

  onUpdate = (item) => {
    const tag = Object.assign({}, item);
    const { store: { getState } } = this.props;
    const tagVariableData = getState().form.marcEditableListForm.values.items;
    const cretaeHeadingForTag = includes(TAG_WITH_NO_HEADING_ASSOCIATED, item.code);
    const displayValue: string = item.displayValue.replace('$', SUBFIELD_DELIMITER);
    const heading = {
      indicator1: item.ind1 || C.EMPTY_STRING,
      indicator2: item.ind2 || C.EMPTY_STRING,
      stringText: displayValue,
      tag: item.code
    };
    if (tag.variableField) {
      this.editHeading(tag);
    } else if (!cretaeHeadingForTag) {
      post(buildUrl(C.ENDPOINT.CREATE_HEADING_URL, C.ENDPOINT.DEFAULT_LANG_VIEW), heading)
        .then((r) => {
          return r.json();
        }).then((data) => {
          tagVariableData.filter(t => t.code === item.code).map(k => {
            k.fieldStatus = RECORD_FIELD_STATUS.NEW;
            k.variableField = {
              ind1: data.indicator1 || C.SPACED_STRING_DOUBLE_QUOTE,
              ind2: data.indicator2 || C.SPACED_STRING_DOUBLE_QUOTE,
              category: data.category,
              displayValue: data.stringText.replace(SUBFIELD_DELIMITER, '$'),
              keyNumber: data.headingNumber,
            };
            return data;
          });
        });
    } else {
      tagVariableData.filter(t => t.code === item.code).map(k => {
        k.variableField = {
          ind1: item.ind1 || C.SPACED_STRING_DOUBLE_QUOTE,
          ind2: item.ind2 || C.SPACED_STRING_DOUBLE_QUOTE,
          displayValue: displayValue || C.SPACED_STRING_DOUBLE_QUOTE,
          keyNumber: 0,
        };
        k.fieldStatus = RECORD_FIELD_STATUS.NEW;
        return k;
      });
    }
  }


  onCreate = () => { this.showMessage('Tag Saved sucesfully'); }

  onDelete = (item) => {
    const { dispatch } = this.props;
    const heading = {
      indicator1: item.variableField.ind1,
      indicator2: item.variableField.ind2,
      stringText: item.variableField.displayValue,
      tag: item.code,
      category: item.category,
      headingNumber: item.variableField.keyNumber
    };
    dispatch(headingDeleteAction(heading));
  };

  saveRecord = () => {
    const { reset } = this.props;
    const body = this.composeBodyJson();

    post(buildUrl(C.ENDPOINT.BIBLIOGRAPHIC_RECORD, C.ENDPOINT.DEFAULT_LANG_VIEW), body)
      .then(() => {
        this.showMessage('Record saved with success');
        setTimeout(() => {
          this.handleClose();
          reset();
        }, 2000);
      }).catch(() => {
        this.showMessage('Error on saved record!');
      });
  };

  composeBodyJson = () => {
    const { data, data: { data: { emptyRecord } }, store: { getState } } = this.props;
    let bibliographicRecord;
    const formData = getState().form.bibliographicRecordForm.values;
    const tagVariableData = getState().form.marcEditableListForm.values.items;

    // Set leader
    if (!bibliographicRecord) bibliographicRecord = Object.assign(emptyRecord.results, bibliographicRecord);
    bibliographicRecord.leader.value = formData.Leader;

    const recordTemplate = {
      id: data.template.records[0].id,
      name: data.template.records[0].name,
      type: 'B',
      fields: []
    };
    bibliographicRecord.fields = union(bibliographicRecord.fields, tagVariableData);
    bibliographicRecord.fields = Object.values(bibliographicRecord.fields.reduce((acc, cur) => Object.assign(acc, { [cur.code]: cur }), {}));
    bibliographicRecord.fields = sortBy(bibliographicRecord.fields, 'code');
    bibliographicRecord.fields
      .filter(f => f.fixedField === undefined || !f.fixedField)
      .filter(f => f.variableField.code !== '040')
      .forEach(element => {
        element.fieldStatus = RECORD_FIELD_STATUS.NEW;
        element.variableField.displayValue = element.variableField.displayValue.replace('$', 'ee');
      });
    bibliographicRecord.verificationLevel = 1;
    return {
      bibliographicRecord,
      recordTemplate
    };
  }

  handleClose = () => {
    const { datastore, dispatch, router, toggleFilterPane } = this.props;
    dispatch({ type: ActionTypes.FILTERS, payload: {}, filterName: '', isChecked: false });
    toggleFilterPane();
    const { emptyRecord } = datastore;
    const id = emptyRecord.results.id;
    router.push(`/marccat/search?id=${id}`);
  };

  showMessage(message: string) {
    this.callout.current.sendCallout({
      type: 'success',
      message: (
        <span>
          {message}
        </span>
      )
    });
  }

  renderDropdownLabels = () => {
    return [
      {
        label: <FormattedMessage id="ui-marccat.button.new.auth" />,
        shortcut: <FormattedMessage id="ui-marccat.button.new.short.auth" />,
        onClick: () => { },
      },
      {
        label: <FormattedMessage id="ui-marccat.button.new.bib" />,
        shortcut: <FormattedMessage id="ui-marccat.button.new.short.bib" />,
        onClick: () => { },
      }];
  };

  renderButtonMenu = () => {
    return (
      <PaneMenu>
        <Button
          buttonStyle="primary"
          onClick={this.saveRecord}
          buttonClass={style.rightPosition}
          type="button"
          marginBottom0
        >
          <Icon icon="plus-sign">
            {<FormattedMessage id="ui-marccat.template.record.create" />}
          </Icon>
        </Button>
      </PaneMenu>
    );
  };

  render() {
    const {
      settings,
      leaderData,
      datastore: { emptyRecord },
    } = this.props;
    const defaultTemplate = (settings) ? settings.defaultTemplate : C.SETTINGS.DEFAULT_TEMPLATE;
    const bibliographicRecord = !isEmpty(emptyRecord) ? emptyRecord.results : {};

    return (!bibliographicRecord) ?
      (
        <Paneset static>
          <Pane
            defaultWidth="fullWidth"
            paneTitle={(bibliographicRecord) ? 'New Monograph' : 'New Monograph'}
            paneSub={(bibliographicRecord) ? 'id. ' + bibliographicRecord.id : 'id. ' + defaultTemplate.id}
            appIcon={<AppIcon app={C.META.ICON_TITLE} />}
            actionMenu={ActionMenuTemplate}
            dismissible
            onClose={() => this.handleClose()}
            lastMenu={this.renderButtonMenu()}
          >
            <Icon icon="spinner-ellipsis" />
          </Pane>
        </Paneset>
      ) :
      (
        <React.Fragment>
          <Paneset static>
            <Pane
              defaultWidth="fullWidth"
              paneTitle={(bibliographicRecord) ? 'New Monograph' : 'New Monograph'}
              paneSub={(bibliographicRecord) ? 'id. ' + bibliographicRecord.id : 'id. ' + defaultTemplate.id}
              appIcon={<AppIcon app={C.META.ICON_TITLE} />}
              actionMenu={ActionMenuTemplate}
              dismissible
              onClose={() => this.handleClose()}
              lastMenu={this.renderButtonMenu()}
            >
              <Row center="xs">
                <div className={style.recordContainer}>
                  <AccordionSet>
                    <KeyValue
                      value={<h2>{bibliographicRecord.name}</h2>}
                    />
                    <form name="bibliographicRecordForm" onSubmit={this.saveRecord}>
                      <Accordion label="Suppress" id="suppress" separator={false}>
                        <SingleCheckboxIconButton labels={['Suppress from Discovery']} pullLeft widthPadding />
                      </Accordion>
                      <Accordion label="Leader" id="leader">
                        <MarcLeader
                          {...this.props}
                          readOnly
                          leaderData={leaderData}
                          leaderCode={bibliographicRecord.leader.code}
                          leaderValue={bibliographicRecord.leader.value}
                        />
                      </Accordion>
                      <Accordion label="Control fields (001, 003, 005, 008)" id="control-field-create-record">
                        <FixedFields
                          {...this.props}
                          record={bibliographicRecord}
                          fidexFields={bibliographicRecord.fields}
                        />
                      </Accordion>
                    </form>
                    <Accordion label="variable fields" id="variable-field">
                      <VariableFields
                        fields={bibliographicRecord.fields.filter(f => f.fixedField === undefined || !f.fixedField)}
                        onDelete={this.onDelete}
                        onSave={this.onSave}
                        onUpdate={this.onUpdate}
                        onCreate={this.onCreate}
                        {...this.props}
                      />
                    </Accordion>
                  </AccordionSet>
                </div>
              </Row>
            </Pane>
          </Paneset>
          <Callout ref={this.callout} />
        </React.Fragment>
      );
  }
}

export default reduxForm({
  form: 'bibliographicRecordForm',
  destroyOnUnmount: false,
})(connect(
  ({ marccat: { data, template, recordDetail, leaderData, headerTypes006, headerTypes007, headerTypes008 } }) => ({
    emptyRecord: data.results,
    bibliographicRecord: template.recordsById,
    recordDetail: recordDetail.isReady,
    defaultTemplate: template.records,
    leaderData: leaderData.records,
    tagIsLoading: leaderData.isLoading,
    tagIsReady: leaderData.isReady,
    headerTypes006Result: headerTypes006.results,
    headerTypes007Result: headerTypes007.results,
    headerTypes008Result: headerTypes008.results,
  }),
)(CreateMarcRecord));
