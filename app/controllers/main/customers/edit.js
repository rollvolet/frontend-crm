import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['editMode'],
  editMode: false,
  selectedTab: 0,
  actions: {
    openEdit() {
      this.set('editMode', true);
    },
    closeEdit() {
      this.set('editMode', false);
    }
  }
});
