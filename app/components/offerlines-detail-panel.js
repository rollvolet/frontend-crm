import Component from '@ember/component';
import { sort } from '@ember/object/computed';

export default Component.extend({
  model: null,

  sorting: Object.freeze(['sequenceNumber']),
  sortedOfferlines: sort('model', 'sorting')
});
