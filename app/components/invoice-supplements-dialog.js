import Component from '@ember/component';

export default Component.extend({
  tagName: '',

  show: false,
  actions: {
    close() {
      this.set('show', false);
    }
  }
});
