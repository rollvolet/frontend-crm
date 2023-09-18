import { attr } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';
import constants from '../config/constants';

const { ACCOUNTANCY_EXPORT_TYPES } = constants;

export default class AccountancyExport extends ValidatedModel {
  validators = {
    date: new Validator('presence', {
      presence: true,
    }),
    fromNumber: [
      new Validator('presence', {
        presence: true,
      }),
      new Validator('number', {
        integer: true,
        gt: 0,
      }),
    ],
    untilNumber: [
      new Validator('presence', {
        presence: true,
      }),
      new Validator('number', {
        integer: true,
        gt: 0,
      }),
    ],
  };

  @attr('datetime') date;
  @attr('string') type;
  @attr('number') fromNumber;
  @attr('number') untilNumber;

  get isDryRun() {
    return this.type == ACCOUNTANCY_EXPORT_TYPES.DRY_RUN;
  }
}
