import Component from '@ember/component';

export default Component.extend({
  init() {
    this._super(...arguments);

    const units = [
      { value: 'stuk(s)' },
      { value: 'm' },
      { value: 'm2' }
    ];
    this.set('options', units);
  },

  didReceiveAttrs() {
    this._super(...arguments);

    const selectedOption = this.options.find(o => o.value == this.value);
    this.set('selectedOption', selectedOption);
  },

  label: 'Eenheid',
  value: null,
  errors: null,
  required: false,
  onSelectionChange: null,

  actions: {
    changeSelection(option) {
      this.set('selectedOption', option);
      const value = option ? option.value : null;
      this.onSelectionChange(value);
    }
  }
});
