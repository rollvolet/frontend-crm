import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class InputFieldCalendarPeriodSelectComponent extends Component {
  @service store;

  @tracked options = [];

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
      { name: 'Rond uur', value: 'benaderend uur' },
    ];
  }

  @cached
  get selectedOption() {
    return this.options.find((o) => o.value == this.args.value);
  }

  get required() {
    return this.args.required || false;
  }

  get placeholder() {
    return this.required && this.args.label ? `${this.args.label} *` : this.args.label;
  }

  @action
  changeSelection(option) {
    const value = option ? option.value : null;
    this.args.onSelectionChange(value);
  }
}
