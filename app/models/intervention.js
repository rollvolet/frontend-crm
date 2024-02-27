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

  @belongsTo('case', { inverse: 'intervention', async: true }) case;
  @belongsTo('calendar-event', { inverse: 'intervention', async: true }) visit;
  @belongsTo('concept', { inverse: null, async: true }) wayOfEntry;
  @belongsTo('employee', { inverse: 'acceptedInterventions', async: true }) employee;
  @hasMany('employee', { inverse: 'interventions', async: true }) technicians;
  @belongsTo('file', { inverse: 'intervention', async: true }) document;
  @belongsTo('order', { inverse: 'interventions', async: true }) origin;
  @belongsTo('request', { inverse: 'origin', async: true }) followUpRequest;

  get isMasteredByAccess() {
    return this.source == 'Access';
  }
}
