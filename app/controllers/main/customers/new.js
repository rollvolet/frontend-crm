import { warn } from '@ember/debug';
import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    close() {
      this.transitionToRoute('main.customers.index');
    }
  }
});
