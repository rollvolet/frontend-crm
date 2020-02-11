import Model, { attr, belongsTo } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';
import { dateString } from '../utils/date-string';

const Validations = buildValidations({
  requestDate: validator('presence', true)
});

export default class RequestModel extends Model.extend(Validations, LoadableModel) {
  @attr('date-midnight') requestDate
  @attr requiresVisit
  @attr comment
  @attr employee
  @attr visitor
  @attr offerExpected

  @belongsTo('customer') customer
  @belongsTo('contact') contact
  @belongsTo('building') building
  @belongsTo('way-of-entry') wayOfEntry
  @belongsTo('calendar-event') calendarEvent
  @belongsTo('offer') offer

  @dateString('requestDate') requestDateStr
}
