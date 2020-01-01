import classic from 'ember-classic-decorator';
import { reads } from '@ember/object/computed';
import DS from 'ember-data';
const { Model, attr } = DS;

@classic
export default class ProductUnit extends Model {
  @attr code;
  @attr nameNed;
  @attr nameFra;

  @reads('nameNed')
  name;
}
