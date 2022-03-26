import { attr } from '@ember-data/model';
import { isPresent } from '@ember/utils';
import ValidatedModel, { Validator } from './validated-model';

export default class CalendarEventModel extends ValidatedModel {
  validators = {
    date: new Validator('presence', {
      presence: true,
    }),
  };

  @attr('date') date;
  @attr subject;
  @attr description;
  @attr location;
  @attr msIdentifier;
  @attr url;
  @attr('string', {
    defaultValue() {
      return 'RKB';
    },
  })
  source;

  // TODO enable once request has moved to triplestore
  @attr request;
  // @belongsTo('request') request;

  get isAvailableInCalendar() {
    return isPresent(this.msIdentifier);
  }

  get isMasteredByAccess() {
    return this.source == 'Access';
  }
}
