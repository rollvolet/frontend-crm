import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['editMode', 'selectedTab'],
  editMode: false,
  selectedTab: 2, // requests tab
  actions: {
    openEdit() {
      this.set('editMode', true);
    },
    closeEdit() {
      this.set('editMode', false);
    },
    onRemove() {
      this.transitionToRoute('main.customers.index');
    }
  }
});
