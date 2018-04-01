import Controller from '@ember/controller';
import { mapBy } from 'ember-awesome-macros/array';
import { sum } from 'ember-awesome-macros';
import raw from 'ember-macro-helpers/raw';

export default Controller.extend({
  showWorkingHoursDialog: false,
  workingHoursAmount: sum(mapBy('model.workingHours', raw('amount'))),
  actions: {
    closeWorkingHoursDialog() {
      this.set('showWorkingHoursDialog', false);
    },
    openWorkingHoursDialog() {
      this.set('showWorkingHoursDialog', true);
    }
  }
});
