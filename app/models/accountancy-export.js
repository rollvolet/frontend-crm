import Model, { attr } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  date: validator('presence', true),
  fromNumber: [
    validator('presence', true),
    validator('number', {
      integer: true,
      gt: 0,
    }),
  ],
  untilNumber: [
    validator('presence', true),
    validator('number', {
      integer: true,
      gt: 0,
    }),
  ],
});

export default class AccountancyExport extends Model.extend(Validations) {
  @attr('datetime') date;
  @attr('datetime') fromDate;
  @attr('datetime') untilDate;
  @attr fromNumber;
  @attr untilNumber;
  @attr isDryRun;
}
