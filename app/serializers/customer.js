import ApplicationSerializer from './application';

export default class CustomerSerializer extends ApplicationSerializer {
  shouldSerializeHasMany(snapshot, key) {
    if (key == 'keywords') {
      return true;
    } else {
      return super.shouldSerializeHasMany(...arguments);
    }
  }
}
