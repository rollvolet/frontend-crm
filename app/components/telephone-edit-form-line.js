import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { computed } from '@ember/object';

const digitsOnly = /\D/g;

export default Component.extend({
  tagName: 'tr',

  store: service(),

  model: null,
  remove: null,
  save: null,
  errorMessages: A(),

  formattedNumber: computed('model.number', function() {
    if (this.model.number) {
      const number = this.model.number.replace(digitsOnly, '');
      if (number.length > 6) {
        return `${number.substr(0,3)} ${number.substr(3,2)} ${number.substr(5)}`;
      } else if (number.length >= 5) {
        return `${number.substr(0,2)} ${number.substr(2,2)} ${number.substr(4)}`;
      } else if (number.length >= 3) {
        return `${number.substr(0,2)} ${number.substr(2,2)}`;
      } else {
        return number;
      }
    } else {
      return this.model.number;
    }
  }),

  actions: {
    setArea(area) {
      if (area)
        area = area.replace(digitsOnly, '');
      this.model.set('area', area);
    },
    setNumber(number) {
      if (number)
        number = number.replace(digitsOnly, '');
      this.model.set('number', number);
    }
  }
});
