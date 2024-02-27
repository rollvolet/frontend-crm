import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class ConceptModel extends Model {
  @attr('string') uri;
  @attr('string') label;
  @attr('languageStringSet') langLabel;
  @attr('string') altLabel;
  @attr('string') notation;
  @attr('number') position;

  @hasMany('concept-scheme', { inverse: 'concepts', async: true }) conceptSchemes;
  @hasMany('concept-scheme', { inverse: 'topConcepts', async: true }) topConceptSchemes;
  @hasMany('concept', { inverse: 'broader', async: true }) narrower;
  @belongsTo('concept', { inverse: 'narrower', async: true }) broader;
}
