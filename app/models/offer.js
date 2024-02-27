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
  @attr('string') documentIntro;
  @attr('string') documentOutro;
  @attr('string') documentVersion;
  @attr('string', {
    defaultValue() {
      return 'RKB';
    },
  })
  source;

  @belongsTo('case', { inverse: 'offer', async: true }) case;
  @hasMany('offerline', { inverse: 'offer', async: true }) offerlines;
  @belongsTo('file', { inverse: 'offer', async: true }) document;

  get isMasteredByAccess() {
    return this.source == 'Access';
  }
}
