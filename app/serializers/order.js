import ApplicationSerializer from './application';

export default class OrderSerializer extends ApplicationSerializer {
  shouldSerializeHasMany(snapshot, key /*, relationshipType*/) {
    if (key == 'technicians') {
      return true;
    } else {
      return super.shouldSerializeHasMany(...arguments);
    }
  }
}
