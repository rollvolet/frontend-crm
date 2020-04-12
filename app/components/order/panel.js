import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { keepLatestTask, task } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import { action } from '@ember/object';
import { debug, warn } from '@ember/debug';

export default class OrderPanelComponent extends Component {
  @service case
  @service documentGeneration
  @service router
  @service store

  @tracked vatRate
  @tracked depositInvoices = []
  @tracked invoicelines = []
  @tracked showUnsavedChangesDialog = false

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    const model = this.args.model;
    this.vatRate = yield model.load('vatRate', { backgroundReload: false }); // included in route's model hook
    this.deposits = yield model.deposits;
    this.depositInvoices = yield model.load('depositInvoices');
    this.invoicelines = yield model.load('invoicelines');
  }

  get isDisabledEdit() {
    return this.args.model.isMasteredByAccess || this.invoice;
  }

  get isEnabledDelete() {
    return !this.isDisabledEdit && !this.depositInvoices.length && !this.deposits.length;
  }

  get request() {
    return this.case.current && this.case.current.request;
  }

  get offer() {
    return this.case.current && this.case.current.offer;
  }

  get invoice() {
    return this.case.current && this.case.current.invoice;
  }

  get hasUnsavedChanges() {
    const invoicelineWithUnsavedChanges = this.invoicelines.find(o => o.isNew || o.validations.isInvalid || o.isError);
    return invoicelineWithUnsavedChanges != null
        || this.args.model.isNew || this.args.model.validations.isInvalid || this.args.model.isError
        || (this.save.last && this.save.last.isError);
  }

  @task
  *rollbackTree() {
    const rollbackPromises = [];

    this.invoicelines.forEach(invoiceline => {
      invoiceline.rollbackAttributes();
      rollbackPromises.push(invoiceline.belongsTo('vatRate').reload());
    });

    this.args.model.rollbackAttributes();
    rollbackPromises.push(this.args.model.belongsTo('vatRate').reload());

    yield all(rollbackPromises);
    yield this.save.perform(null, { forceSuccess: true });
  }

  @task
  *remove() {
    try {
      yield all(this.invoicelines.map(l => l.destroyRecord()));
      this.case.updateRecord('order', null);
      yield this.args.model.destroyRecord();
      // TODO: Fix this hack when Ember Data allows creation of already deleted ID
      // See https://github.com/emberjs/data/issues/5006
      // this.store._removeFromIdMap(this.args.model._internalModel);
      this.router.transitionTo('main.case.offer.edit', this.offer);
    } catch (e) {
      warn(`Something went wrong while destroying order ${this.args.model.id}`, { id: 'destroy-failure' });
      this.offer.order = this.args.model;
      yield this.offer.save();
      yield this.args.model.rollbackAttributes(); // undo delete-state
      this.case.updateRecord('order', this.args.model);
    }
  }

  @keepLatestTask
  *save(_, { forceSuccess = false } = {} ) {
    if (forceSuccess) return;

    const { validations } = yield this.args.model.validate();
    let requiresOfferReload = false;
    if (validations.isValid) {
      const changedAttributes = this.args.model.changedAttributes();
      const fieldsToSyncWithInvoice = ['reference', 'comment'];
      for (let field of fieldsToSyncWithInvoice) {
        if (changedAttributes[field]) {
          if (this.invoice) {
            debug(`Syncing ${field} of invoice with updated ${field} of order`);
            this.invoice[field] = this.args.model[field];
            yield this.invoice.save();
          }
          requiresOfferReload = true;
        }
      }

      yield this.args.model.save();

      if (requiresOfferReload)
        yield this.args.model.belongsTo('offer').reload();
    }

    const changedAttributesOnRequest = this.request.changedAttributes();
    if (changedAttributesOnRequest['visitor'])
      yield this.request.save();
  }

  @task
  *generateOrderDocument() {
    try {
      yield this.documentGeneration.orderDocument(this.args.model);
    } catch(e) {
      warn(`Something went wrong while generating the order document`, { id: 'document-generation-failure' });
    }
  }

  @task
  *generateDeliveryNote() {
    try {
      yield this.documentGeneration.deliveryNote(this.args.model);
    } catch(e) {
      warn(`Something went wrong while generating the delivery note`, { id: 'document-generation-failure' });
    }
  }

  @action
  closeEdit() {
    if (this.hasUnsavedChanges) {
      this.showUnsavedChangesDialog = true;
    } else {
      this.args.onCloseEdit();
    }
  }

  @action
  closeUnsavedChangesDialog() {
    this.showUnsavedChangesDialog = false;
  }

  @action
  async confirmCloseEdit() {
    this.showUnsavedChangesDialog = false;
    await this.rollbackTree.perform();
    this.args.onCloseEdit();
  }

  @action
  downloadOrderDocument() {
    this.documentGeneration.downloadOrderDocument(this.args.model);
  }

  @action
  downloadDeliveryNote() {
    this.documentGeneration.downloadDeliveryNote(this.args.model);
  }
}
