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
  // TODO enable once intervention has moved to triplestore
  @attr intervention;
  // @belongsTo('intervention') intervention;
  // TODO enable once order has moved to triplestore
  @attr order;
  // @belongsTo('order') order;

  get isMasteredByAccess() {
    return this.source == 'Access';
  }
}
