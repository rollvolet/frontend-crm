import Model, { attr } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';
import { dateString } from '../utils/date-string';

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
  @attr('date') date;
  @attr('date') fromDate;
  @attr('date') untilDate;
  @attr fromNumber;
  @attr untilNumber;
  @attr isDryRun;

  @dateString('fromDate') fromDateStr;
  @dateString('untilDate') untilDateStr;
}
