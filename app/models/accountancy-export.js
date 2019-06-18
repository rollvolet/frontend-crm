import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';
import { dateString } from '../utils/date-string';

const Validations = buildValidations({
  date: validator('presence', true),
  fromNumber: [
    validator('presence', true),
    validator('number', {
      integer: true,
      gt: 0
    })
  ],
  untilNumber: [
    validator('presence', true),
    validator('number', {
      integer: true,
      gt: 0
    })
  ]
});

export default DS.Model.extend(Validations, {
  date: DS.attr('date'),
  fromDate: DS.attr('date'),
  untilDate: DS.attr('date'),
  fromNumber: DS.attr(),
  untilNumber: DS.attr(),
  isDryRun: DS.attr(),

  fromDateStr: dateString('fromDate'),
  untilDateStr: dateString('untilDate')
});
