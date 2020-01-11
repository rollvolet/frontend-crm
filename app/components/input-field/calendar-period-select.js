import classic from 'ember-classic-decorator';
import { action, computed } from '@ember/object';
import Component from '@ember/component';

@classic
export default class CalendarPeriodSelect extends Component {
  init() {
    super.init(...arguments);

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
  }

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);

    const selectedOption = this.options.find(o => o.value == this.value);
    this.set('selectedOption', selectedOption);
  }

  label = 'Periode';
  value = null;
  errors = null;
  required = false;
  onSelectionChange = null;

  @computed('label', 'required')
  get placeholder() {
    return this.required ? `${this.label} *` : this.label;
  }

  @action
  changeSelection(option) {
    this.set('selectedOption', option);
    const value = option ? option.value : null;
    this.onSelectionChange(value);
  }
}
