import Component from '@glimmer/component';
import { task } from 'ember-concurrency';

export default class InvoicelineEditComponent extends Component {
  @task(function * () {
    const { validations } = yield this.args.model.validate();
    if (validations.isValid)
      yield this.args.model.save();
  })
  save;
}
