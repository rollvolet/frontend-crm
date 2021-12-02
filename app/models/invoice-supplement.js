import Model, { attr, belongsTo } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  nbOfPieces: validator('number', {
    positive: true,
  }),
});

export default class InvoiceSupplementModel extends Model.extend(Validations) {
  @attr sequenceNumber;
  @attr('number') nbOfPieces;
  @attr('number') amount;
  @attr description;

  @belongsTo('invoice') invoice;
  @belongsTo('product-unit') unit;
}
