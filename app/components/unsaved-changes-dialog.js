import Component from '@ember/component';

export default Component.extend({
  tagName: '',

  show: false,
  onConfirm: null,

  actions: {
    cancelClose() {
      this.set('show', false);
    },
    confirmClose() {
      this.set('show', false);
      this.onConfirm();
    }
  }
});
