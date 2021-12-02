import Model, { attr, hasMany } from '@ember-data/model';

export default class HonorificPrefixModel extends Model {
  @attr name;

  @hasMany('customer') customers;

  get entityId() {
    return this.id.substring(0, this.id.indexOf('-'));
  }

  get languageId() {
    return this.id.substring(this.id.indexOf('-') + 1);
  }
}

const composeId = function (entityId, languageId) {
  return `${entityId}-${languageId}`;
};

export { composeId };
