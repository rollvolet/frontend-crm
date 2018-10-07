import Component from '@ember/component';

export default Component.extend({
  model: null,
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
