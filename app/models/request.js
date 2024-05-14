import { attr, belongsTo } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';
import { isPresent } from '@ember/utils';

export default class RequestModel extends ValidatedModel {
  validators = {
    requestDate: new Validator('presence', {
      presence: true,
    }),
    employee: new Validator('presence', {
      presence: true,
    }),
  };

  @attr('string') uri;
  @attr('date') requestDate;
  @attr('number') number;
  @attr('string') description;
  @attr('string') comment;
  @attr('date') indicativeVisitDate;
  @attr('string') indicativeVisitPeriod;
  @attr('string', {
    defaultValue() {
      return 'RKB';
    },
  })
  source;

  @belongsTo('case', { inverse: 'request', async: true }) case;
  @belongsTo('calendar-event', { inverse: 'request', async: true }) visit;
  @belongsTo('time-slot', { inverse: 'request', async: true }) timeSlot;
  @belongsTo('concept', { inverse: null, async: true }) wayOfEntry;
  @belongsTo('employee', { inverse: 'acceptedRequests', async: true }) employee;
  @belongsTo('employee', { inverse: 'visitedRequests', async: true }) visitor;
  @belongsTo('intervention', { inverse: 'followUpRequest', async: true }) origin;

  get isMasteredByAccess() {
    return this.source == 'Access';
  }

  get requiresVisit() {
    return isPresent(this.indicativeVisitDate);
  }
}
