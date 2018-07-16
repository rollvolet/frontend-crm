import Component from '@ember/component';

export default Component.extend({
  init() {
    this._super(...arguments);

    const periods = [
      { name: 'Gehele dag', value: 'GD' },
      { name: 'Voormiddag (9-12)', value: 'VM' },
      { name: 'Namiddag (12-16)', value: 'NM' },
      { name: 'Losse uren', value: 'van-tot' },
      { name: 'Vanaf', value: 'vanaf' },
      { name: 'Uur', value: 'bepaald uur' },
      { name: 'Uur (stipt)', value: 'stipt uur' },
      { name: 'Rond uur', value: 'benaderend uur' }
    ];
    this.set('options', periods);
  },

  didReceiveAttrs() {
    this._super(...arguments);

    const selectedOption = this.options.find(o => o.value == this.value);
    this.set('selectedOption', selectedOption);
  },

  label: 'Periode',
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
