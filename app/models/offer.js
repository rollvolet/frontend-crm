import { attr, belongsTo, hasMany } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class OfferModel extends ValidatedModel {
  validators = {
    offerDate: new Validator('presence', {
      presence: true,
    }),
  };

  @attr('string') uri;
  @attr('string') number;
  @attr('date') offerDate;
  @attr('number') amount;
  @attr('string') documentIntro;
  @attr('string') documentOutro;
  @attr('string') documentVersion;
  @attr('string', {
    defaultValue() {
      return 'RKB';
    },
  })
  source;

  @belongsTo('case', { inverse: 'offer' }) case;
  @hasMany('offerline', { inverse: 'offer' }) offerlines;
  @belongsTo('file', { inverse: 'offer' }) document;

  get isMasteredByAccess() {
    return this.source == 'Access';
  }
}
