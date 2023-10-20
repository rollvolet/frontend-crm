import Model, { attr, belongsTo } from '@ember-data/model';

export default class StructuredIdentifier extends Model {
  @attr('number') identifier;
  @attr('string') namespace;

  @belongsTo('case', { inverse: 'structuredIdentifier' })
  case;
}
