import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';

export default class OfferlineEditComponent extends Component {
  @task
  *save() {
    const { validations } = yield this.args.model.validate();
    if (validations.isValid)
      yield this.args.model.save();
  }
}
