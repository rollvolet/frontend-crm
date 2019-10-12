import DS from 'ember-data';
import { reads } from '@ember/object/computed';
const { Model } = DS;

export default Model.extend({
  code: DS.attr(),
  nameNed: DS.attr(),
  nameFra: DS.attr(),

  name: reads('nameNed')
});
