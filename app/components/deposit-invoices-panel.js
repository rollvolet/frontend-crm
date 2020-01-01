import classic from 'ember-classic-decorator';
import Component from '@ember/component';
import { action } from '@ember/object';
import { task, all } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { bool } from '@ember/object/computed';
import { sum, array, raw } from 'ember-awesome-macros';
import { warn } from '@ember/debug';

@classic
export default class DepositInvoicesPanel extends Component {
  @service documentGeneration;

  model = null;
  onCreate = false;
  order = null;
  selected = null;
  showUnsavedChangesDialog = false;
  isDisabledEdit = false // passed as argument

  @bool('selected') editMode
  @computed('model.@each.arithmeticAmount')
  get totalAmount() {
    return this.model.mapBy('arithmeticAmount').reduce((a, b) => a + b, 0);
  }
  @computed('model.@each.arithmeticVat')
  get totalVat() {
    return Promise.all(this.model.mapBy('arithmeticVat')).then(values => {
      return values.reduce((a, b) => a + b, 0);
    });
  }

  @task(function * () {
    const rollbackPromises = [];

    this.selected.rollbackAttributes();

    rollbackPromises.push(this.selected.belongsTo('vatRate').reload());

    yield all(rollbackPromises);

    yield this.save.perform(null, { forceSucces: true });
  })
  rollbackTree;

  @task(function * (_, { forceSuccess = false } = {} ) {
    if (forceSuccess) return;

    const { validations } = yield this.selected.validate();
    if (validations.isValid) {
      yield this.selected.save();
    }
  }).keepLatest()
  save;

  @task(function * (invoice) {
    const oldInvoiceDate = invoice.invoiceDate;
    try {
      invoice.set('invoiceDate', new Date());
      yield invoice.save();
      yield this.documentGeneration.invoiceDocument(invoice);
    } catch(e) {
      warn(`Something went wrong while generating the invoice document`, { id: 'document-generation-failure' });
      invoice.set('invoiceDate', oldInvoiceDate);
      yield invoice.save();
    }
  })
  generateInvoiceDocument;

  @action
  async createNew() {
    const invoice = await this.onCreate();
    this.set('selected', invoice);
  }
  @action
  openEdit(invoice) {
    if (this.selected && this.selected.isNew)
      this.selected.destroyRecord();
    this.set('selected', invoice);
  }
  @action
  closeEdit() {
    if (this.selected.isNew || this.selected.validations.isInvalid || this.selected.isError
        || (this.save.last && this.save.last.isError)) {
      this.set('showUnsavedChangesDialog', true);
    } else {
      this.onUpdateList();
      this.set('selected', null);
    }
  }
  @action
  async confirmCloseEdit() {
    await this.rollbackTree.perform();
    this.onUpdateList();
    this.set('selected', null);
  }
  @action
  async remove(invoice) {
    await invoice.destroyRecord();
    this.onUpdateList();
  }
  @action
  downloadInvoiceDocument(invoice) {
    this.documentGeneration.downloadInvoiceDocument(invoice);
  }
}
