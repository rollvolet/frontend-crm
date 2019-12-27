import Component from '@ember/component';

export default Component.extend({
  tagName: '',

  model: null,
  show: false,
  onClose: null,

  actions: {
    close() {
      this.onClose();
    }
  }
});
