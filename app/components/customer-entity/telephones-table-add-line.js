import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import { tagName } from '@ember-decorators/component';
import { inject as service } from '@ember/service';
import { action, computed } from '@ember/object';

const digitsOnly = /\D/g;

@classic
@tagName('tr')
export default class CustomerEntityTelephonesTableAddLine extends Component {
  @service store

  @computed('model.number')
  get formattedNumber() {
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
  }

  @computed('model.{isError,validations.isInvalid}', 'saveTask.last')
  get canBeSaved() {
    return !this.model.validations.isInvalid
      && !this.model.isError
      && !this.saveTask.last.isError;
  }

  @action
  setArea(area) {
    if (area)
      area = area.replace(digitsOnly, '');
    this.model.set('area', area);
  }

  @action
  setNumber(event) {
    let number = event.target.value;
    if (number)
      number = number.replace(digitsOnly, '');
    this.model.set('number', number);
  }
}
