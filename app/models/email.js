import { attr } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class EmailModel extends ValidatedModel {
  validators = {
    value: new Validator('format', { type: 'email', allowBlank: true }),
  };

  @attr('email') value;
  @attr('string') note;
  // TODO refactor once customers are stored in triplestore
  @attr('string') customer;
  @attr('string') contact;
  @attr('string') building;

  // @belongsTo('customer') customer;
  // @belongsTo('contact') contact;
  // @belongsTo('building') building;
}
