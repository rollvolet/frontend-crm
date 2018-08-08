import { warn } from '@ember/debug';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { debug } from '@ember/debug';

export default Component.extend({
  configuration: service(),

  classNames: ['data-preloader'],

  async didInsertElement() {
    debug('Preloading static lists');
    this.set('isError', false);
    this.set('isLoading', true);
    try {
      await this.configuration.preloadStaticLists();
      this.set('isLoading', false);
    } catch (e) {
      warn(`Failed to preload data: ${e.message || e}`);
      this.set('isError', true);
    }
  }
});
