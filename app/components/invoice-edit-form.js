import Component from '@ember/component';

export default Component.extend({
  model: null,
  save: null,

  actions: {
    setVatRate(vatRate) {
      this.set('model.vatRate', vatRate);
      this.set('model.certificateRequired', vatRate.rate == 6);
    }
  }
});
