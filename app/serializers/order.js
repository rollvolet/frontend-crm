import ApplicationSerializer from './application';
import classic from 'ember-classic-decorator';

@classic
export default class OrderSerializer extends ApplicationSerializer {
  shouldSerializeHasMany(snapshot, key /*, relationshipType*/) {
    if (key == 'technicians') {
      return true;
    } else {
      return super.shouldSerializeHasMany(...arguments);
    }
  }
}
