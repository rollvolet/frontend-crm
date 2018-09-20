import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { debug } from '@ember/debug';

export default Component.extend({
  configuration: service(),

  classNames: ['data-preloader'],

  didInsertElement() {
    debug('Preloading static lists');
    this.configuration.preloadStaticLists.perform();
  }
});
