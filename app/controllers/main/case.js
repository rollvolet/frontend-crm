import Controller from '@ember/controller';
import service from 'ember-service/inject';
import { computed } from '@ember/object';

export default Controller.extend({
  router: service(),
  currentRouteName: computed.oneWay('router.currentRouteName')
});
