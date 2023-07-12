import { attr, belongsTo } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

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
  @attr('string', {
    defaultValue() {
      return 'RKB';
    },
  })
  source;

  @belongsTo('case', { inverse: 'request' }) case;
  @belongsTo('calendar-event', { inverse: 'request' }) visit;
  @belongsTo('concept', { inverse: null }) wayOfEntry;
  @belongsTo('employee', { inverse: 'acceptedRequests' }) employee;
  @belongsTo('employee', { inverse: 'visitedRequests' }) visitor;
  @belongsTo('intervention', { inverse: 'followUpRequest' }) origin;
  @belongsTo('file', { inverse: 'request' }) document;

  get isMasteredByAccess() {
    return this.source == 'Access';
  }
}
