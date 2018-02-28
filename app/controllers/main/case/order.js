import Controller from '@ember/controller';
import ReduceFunctions from '../../../mixins/reduce-functions';

export default Controller.extend(ReduceFunctions, {
  showDeposits: false,
  actions: {
    toggleShowDeposits() {
      this.toggleProperty('showDeposits');
    }
  }
});
