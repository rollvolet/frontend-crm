import classic from 'ember-classic-decorator';
import { classNames } from '@ember-decorators/component';
import Component from '@ember/component';
import { task } from 'ember-concurrency';
import PellOptions from '../mixins/pell-options';

@classic
@classNames('layout-row', 'layout-align-start-center')
export default class OfferlineEditForm extends Component.extend(PellOptions) {
  @task(function * () {
    const { validations } = yield this.model.validate();
    if (validations.isValid)
      yield this.model.save();
  })
  save;
}
