import Component from '@ember/component';

export default Component.extend({
  model: null,
  onDelete: null,
  isDisabledEdit: false,

  actions: {
    delete(offerline) {
      this.onDelete(offerline);
    }
  }
});
