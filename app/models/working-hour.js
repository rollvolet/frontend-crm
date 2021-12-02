import Model, { attr, belongsTo } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';
import { dateString } from '../utils/date-string';

const Validations = buildValidations({
  date: validator('presence', true),
  invoice: validator('presence', true),
  employee: validator('presence', true),
});

export default class WorkingHourModel extends Model.extend(Validations) {
  @attr('date-midnight') date;
  @belongsTo('invoice') invoice;
  @belongsTo('employee') employee;

  @dateString('date') dateStr;
}
