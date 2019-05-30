import React from 'react';
import { TextField } from '@folio/stripes/components';
import { Field } from 'redux-form';
import { decamelizify } from '../../../../../shared';
import { EMPTY_SPACED_STRING } from '../../../../../config/constants';

export default ({ name, onChange, ...props }) => {
  return (
    <Field
      {...props}
      id={name}
      name={name}
      component={TextField}
      label={decamelizify(name, EMPTY_SPACED_STRING)}
      onChange={onChange}
    />
  );
};