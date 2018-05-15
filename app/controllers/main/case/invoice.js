import Controller from '@ember/controller';

export default Controller.extend({
  showWorkingHoursDialog: false,
  actions: {
    closeWorkingHoursDialog() {
      this.set('showWorkingHoursDialog', false);
    },
    openWorkingHoursDialog() {
      this.set('showWorkingHoursDialog', true);
    }
  }
});
