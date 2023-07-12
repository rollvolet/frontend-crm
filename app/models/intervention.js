import { attr, belongsTo, hasMany } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class InterventionModel extends ValidatedModel {
  validators = {
    interventionDate: new Validator('presence', {
      presence: true,
    }),
    scheduledNbOfPersons: new Validator('number', {
      allowBlank: true,
      positive: true,
    }),
  };

  @attr('string') uri;
  @attr('date') interventionDate;
  @attr('number') number;
  @attr('string') description;
  @attr('string') comment;
  @attr('number') scheduledNbOfPersons;
  @attr('string', {
    defaultValue() {
      return 'RKB';
    },
  })
  source;

  @belongsTo('case', { inverse: 'intervention' }) case;
  @belongsTo('calendar-event', { inverse: 'intervention' }) visit;
  @belongsTo('concept', { inverse: null }) wayOfEntry;
  @belongsTo('employee', { inverse: 'acceptedInterventions' }) employee;
  @hasMany('employee', { inverse: 'interventions' }) technicians;
  @belongsTo('file', { inverse: 'offer' }) document;
  @belongsTo('order', { inverse: 'interventions' }) origin;
  @belongsTo('request', { inverse: 'origin' }) followUpRequest;

  get isMasteredByAccess() {
    return this.source == 'Access';
  }
}
