import { attr, belongsTo } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class CalendarEventModel extends ValidatedModel {
  validators = {
    date: new Validator('presence', {
      presence: true,
    }),
  };

  @attr('date') date;
  @attr('string') subject;
  @attr('string') description;
  @attr('string') msIdentifier;
  @attr('string') location;
  @attr('string') url;
  @attr('string') creator;
  @attr('string') editor;
  @attr('datetime') created;
  @attr('datetime') modified;
  @attr('string', {
    defaultValue() {
      return 'RKB';
    },
  })
  source;

  @belongsTo('request', { inverse: 'visit', async: true }) request;
  @belongsTo('intervention', { inverse: 'visit', async: true }) intervention;
  @belongsTo('order', { inverse: 'planning', async: true }) order;

  get isMasteredByAccess() {
    return this.source == 'Access';
  }
}
