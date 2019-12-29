import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { classNames } from '@ember-decorators/component';
import Component from '@ember/component';
import { task } from 'ember-concurrency';
import DecimalInputFormatting from '../mixins/decimal-input-formatting';
import PellOptions from '../mixins/pell-options';

@classic
@classNames('layout-row', 'layout-align-start-center')
export default class OfferlineEditForm extends Component.extend(DecimalInputFormatting, PellOptions) {
  model = null;
  onDelete = null;

  init() {
    super.init(...arguments);
    this.initDecimalInput('amount');
  }

  @task(function * () {
    const { validations } = yield this.model.validate();
    if (validations.isValid)
      yield this.model.save();
  })
  save;

  @action
  delete() {
    this.onDelete(this.model);
  }
}
