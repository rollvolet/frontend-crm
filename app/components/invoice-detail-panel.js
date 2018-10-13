import Component from '@ember/component';

export default Component.extend({
  model: null,
  showWorkingHoursDialog: false,

  actions: {
    openWorkingHoursDialog() {
      this.set('showWorkingHoursDialog', true);
    }
  }
});
