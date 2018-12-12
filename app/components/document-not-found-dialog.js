import Component from '@ember/component';

export default Component.extend({
  show: false,

  actions: {
    close() {
      this.set('show', false);
    }
  }
});
