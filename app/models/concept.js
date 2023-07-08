import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class ConceptModel extends Model {
  @attr('string') uri;
  @attr('string') label;
  @attr('languageStringSet') langLabel;
  @attr('string') altLabel;
  @attr('number') position;

  @hasMany('concept-scheme', { inverse: 'concepts' }) conceptSchemes;
  @hasMany('concept-scheme', { inverse: 'topConcepts' }) topConceptSchemes;
  @hasMany('concept', { inverse: 'broader' }) narrower;
  @belongsTo('concept', { inverse: 'narrower' }) broader;
}
