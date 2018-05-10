import Component from '@ember/component';

export default Component.extend({
  model: null,
  onClose: null,
  onEdit: null,

  actions: {
    toggleEdit() {
      this.onEdit(this.model);
    }
  }
});
