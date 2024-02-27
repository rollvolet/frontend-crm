import { attr, belongsTo } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class EmailModel extends ValidatedModel {
  validators = {
    value: new Validator('format', { type: 'email', allowBlank: true }),
  };

  @attr('email') value;
  @attr('string') note;

  @belongsTo('customer', { inverse: 'emails', async: true }) customer;
  @belongsTo('contact', { inverse: 'emails', async: true }) contact;
  @belongsTo('building', { inverse: 'emails', async: true }) building;
}
