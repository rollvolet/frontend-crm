import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class CalendarPeriodSelect extends Component {
  @service store

  @tracked options = []
  @tracked selected

  constructor() {
    super(...arguments);
    this.options = [
      { name: 'Gehele dag', value: 'GD' },
      { name: 'Voormiddag (9-12)', value: 'VM' },
      { name: 'Namiddag (12-16)', value: 'NM' },
      { name: 'Losse uren', value: 'van-tot' },
      { name: 'Vanaf', value: 'vanaf' },
      { name: 'Uur', value: 'bepaald uur' },
      { name: 'Uur (stipt)', value: 'stipt uur' },
      { name: 'Rond uur', value: 'benaderend uur' }
    ];
    this.selected = this.options.find(o => o.value == this.args.value);
  }


  get required() {
    return this.args.required || false;
  }

  get placeholder() {
    return this.required && this.args.label ? `${this.args.label} *` : this.args.label;
  }

  @action
  changeSelection(option) {
    this.selected = option;
    const value = option ? option.value : null;
    this.args.onSelectionChange(value);
  }
}
