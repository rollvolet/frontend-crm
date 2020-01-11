import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { tagName } from '@ember-decorators/component';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { or, notEmpty } from 'ember-awesome-macros';

@classic
@tagName('')
export default class InvoiceSupplementsDialog extends Component {
  @service
  store;

  show = false;
  model = null;
  showUnsavedChangesWarning = false;

  @or(notEmpty('selected'), 'model.isBooked', 'model.isMasteredByAccess')
  isDisabledNew;

  @or('model.isBooked', 'model.isMasteredByAccess')
  isDisabledEdit;

  @task(function * () {
    this.selected.rollbackAttributes();
    yield this.save.perform(null, { forceSucces: true });
  })
  rollbackTree;

  @(task(function * (_, { forceSuccess = false } = {} ) {
    if (forceSuccess) return;

    const { validations } = yield this.selected.validate();
    if (validations.isValid) {
      yield this.selected.save();
    }
  }).keepLatest())
  save;

  _closeEditSelected() {
    if (this.selected.isNew || this.selected.validations.isInvalid || this.selected.isError
        || (this.save.last && this.save.last.isError)) {
      this.set('showUnsavedChangesWarning', true);
    }
    else {
      this.set('selected', null);
    }
  }

  @action
  createNew() {
    const supplement = this.store.createRecord('invoice-supplement', {
      invoice: this.model
    });
    this.set('selected', supplement);
    this.save.perform();
  }

  @action
  close() {
    if (this.selected)
      this._closeEditSelected();

    if (!this.showUnsavedChangesWarning)
      this.set('show', false);
  }

  @action
  openEdit(supplement) {
    if (this.selected && this.selected.isNew)
      this.selected.destroyRecord();
    this.set('selected', supplement);
  }

  @action
  closeEdit() {
    this._closeEditSelected();
  }

  @action
  cancelCloseEdit() {
    this.set('showUnsavedChangesWarning', false);
  }

  @action
  async confirmCloseEdit() {
    await this.rollbackTree.perform();
    this.set('showUnsavedChangesWarning', false);
    this.set('selected', null);
  }

  @action
  async deleteSupplement(supplement) {
    const supplements = await this.model.supplements;
    supplements.removeObject(supplement);
    supplement.destroyRecord();
  }
}
