import Model, { attr } from '@ember-data/model';

export default class ProductUnit extends Model {
  @attr code
  @attr nameNed
  @attr nameFra

  get name() {
    return this.nameNed;
  }
}
