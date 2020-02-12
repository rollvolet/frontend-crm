import Component from '@glimmer/component';
import { keepLatestTask } from 'ember-concurrency-decorators';

export default class OfferlineEditComponent extends Component {
  @keepLatestTask
  *save() {
    const { validations } = yield this.args.model.validate();
    if (validations.isValid)
      yield this.args.model.save();
  }
}
