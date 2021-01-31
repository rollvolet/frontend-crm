import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { get, set } from '@ember/object';

export default class OfferDocumentLineComponent extends Component {
  @tracked isEdit = false;

  get value() {
    return get(this.args.model, this.args.field);
  }

  @task
  *save() {
    if (this.args.model.hasDirtyAttributes) {
      const { validations } = yield this.args.model.validate();
      if (validations.isValid) {
        yield this.args.model.save();
      }
    }
  }

  @action
  setValue(value) {
    set(this.args.model, this.args.field, value);
  }

  @action
  openEdit() {
    this.isEdit = true;
  }

  @action
  async closeEdit() {
    this.isEdit = false;
  }

}
