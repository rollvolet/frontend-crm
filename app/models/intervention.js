import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';
import { dateString } from '../utils/date-string';

const Validations = buildValidations({
  date: validator('presence', true)
});

export default class InterventionModel extends Model.extend(Validations, LoadableModel) {
  @attr('date-midnight') date
  @attr comment
  @attr('date-midnight') planningDate
  @attr planningMsObjectId

  @belongsTo('customer') customer
  @belongsTo('contact') contact
  @belongsTo('building') building
  @belongsTo('way-of-entry') wayOfEntry
  @belongsTo('invoice') invoice
  @belongsTo('order') origin
  @belongsTo('request') followUpRequest
  @hasMany('employee') technicians

  @dateString('date') dateStr

  get isPlanned() {
    return this.planningMsObjectId != null;
  }
}
