import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class VisitCalendarDayNoteComponent extends Component {
  @tracked editMode = false;
  @tracked value = this.args.value;

  save = task(async () => {
    this.editMode = false;
    await this.args.onSave(this.value);
  });

  @action
  openEditMode() {
    this.editMode = true;
  }

  @action
  cancel() {
    this.editMode = false;
    this.value = this.args.value;
  }
}
