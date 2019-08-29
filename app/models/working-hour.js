import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';
import { dateString } from '../utils/date-string';

const Validations = buildValidations({
  date: validator('presence', true),
  invoice: validator('presence', true),
  employee: validator('presence', true)
});


export default DS.Model.extend(Validations, {
  date: DS.attr('date-midnight'),
  invoice: DS.belongsTo('invoice'),
  employee: DS.belongsTo('employee'),

  dateStr: dateString('date')
});
