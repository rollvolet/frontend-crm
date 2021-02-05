import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';

export default class OfferlineDetailComponent extends Component {
  @tracked editMode = false;

  constructor() {
    super(...arguments);
    this.editMode = this.args.model.isNew;
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
