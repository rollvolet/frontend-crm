import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Controller.extend({
  router: inject(),
  currentRouteName: computed.oneWay('router.currentRouteName')
});
