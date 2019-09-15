import Component from '@ember/component';
import PellOptions from '../mixins/pell-options';

export default Component.extend(PellOptions, {
  model: null,
  save: null,

  actions: {
    setVatRate(vatRate) {
      this.set('model.vatRate', vatRate);
      this.set('model.certificateRequired', vatRate.rate == 6);
    }
  }
});
