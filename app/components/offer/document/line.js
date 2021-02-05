import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { get, set } from '@ember/object';

export default class OfferDocumentLineComponent extends Component {
  @tracked editMode = false;

  get value() {
    return get(this.args.model, this.args.field);
  }

  @action
  setValue(value) {
    set(this.args.model, this.args.field, value);
  }

  @action
  openEdit() {
    this.editMode = true;
  }

  @action
  closeEdit() {
    this.editMode = false;
  }
}
