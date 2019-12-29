import classic from 'ember-classic-decorator';
import { reads } from '@ember/object/computed';
import DS from 'ember-data';
const { Model } = DS;

@classic
export default class ProductUnit extends Model {
  code;
  nameNed;
  nameFra;

  @reads('nameNed')
  name;
}
