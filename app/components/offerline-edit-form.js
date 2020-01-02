import classic from 'ember-classic-decorator';
import { classNames } from '@ember-decorators/component';
import Component from '@ember/component';
import { task } from 'ember-concurrency';

@classic
@classNames('layout-row', 'layout-align-start-center')
export default class OfferlineEditForm extends Component {
  @task(function * () {
    const { validations } = yield this.model.validate();
    if (validations.isValid)
      yield this.model.save();
  })
  save;
}
