// eslint-disable-next-line import/no-unresolved
import { describe, beforeEach, it } from '@bigtest/mocha';
// eslint-disable-next-line import/no-unresolved
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import ApplicationInteractor from '../interactors/application';

describe('Application', () => {
  const app = new ApplicationInteractor();

  setupApplication();

  beforeEach(function () {
    this.visit('/');
  });

  it('renders', () => {
    expect(app.isPresent).to.be.true;
  });
});