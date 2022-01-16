import { attr } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

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
  @attr('datetime') fromDate;
  @attr('datetime') untilDate;
  @attr fromNumber;
  @attr untilNumber;
  @attr isDryRun;
}
