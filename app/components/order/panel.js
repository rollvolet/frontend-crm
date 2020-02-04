import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task, all } from 'ember-concurrency';
import { action } from '@ember/object';
import { debug, warn } from '@ember/debug';

export default class OrderPanelComponent extends Component {
  @service case
  @service documentGeneration
  @service router
  @service store

  @tracked showUnsavedChangesDialog = false
  @tracked vatRate
  @tracked invoice
  @tracked deposits = []
  @tracked depositInvoices = []
  @tracked invoicelines = []

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @(task(function * () {
    const model = this.args.model;
    this.vatRate = yield model.load('vatRate', { backgroundReload: false }); // included in route's model hook
    this.deposits = yield model.load('deposits');
    this.depositInvoices = yield model.load('depositInvoices');
    this.invoice = yield model.load('invoice');
    this.invoicelines = yield model.load('invoicelines');
  }).keepLatest())
  loadData

  get hasInvoice() {
    return this.invoice != null;
  }

  get hasDeposit() {
    return this.deposits.length > 0;
  }

  get hasDepositInvoice() {
    return this.depositInvoices.length > 0;
  }

  get isDisabledEdit() {
    return this.args.model.isMasteredByAccess || this.hasInvoice;
  }

  get isEnabledDelete() {
    return !this.isDisableEdit && !this.hasDepositInvoice && !this.hasDeposit;
  }

  @task(function * () {
    const offer = yield this.args.model.offer;
    try {
      // remove invoicelines
      yield all(this.invoicelines.map(l => l.destroyRecord()));

      // update case-tabs
      this.case.updateRecord('order', null);

      // delete order
      yield this.args.model.destroyRecord();
      // TODO: Fix this hack when Ember Data allows creation of already deleted ID
      // See https://github.com/emberjs/data/issues/5006
      // this.store._removeFromIdMap(this.args.model._internalModel);

      this.router.transitionTo('main.case.offer.edit', offer);
    } catch (e) {
      warn(`Something went wrong while destroying order ${this.args.model.id}`, { id: 'destroy-failure' });

      offer.order = this.args.model;
      yield offer.save();
      this.case.set('current.orderId', this.args.model.id);
      yield this.args.model.rollbackAttributes(); // undo delete-state
    }
  })
  remove;

  @task(function * () {
    this.args.model.rollbackAttributes();
    const rollbackPromises = [];
    rollbackPromises.push(this.args.model.belongsTo('vatRate').reload());
    rollbackPromises.push(this.args.model.belongsTo('contact').reload());
    rollbackPromises.push(this.args.model.belongsTo('building').reload());
    yield all(rollbackPromises);
    yield this.save.perform(null, { forceSuccess: true });
  })
  rollbackTree;

  @task(function * (_, { forceSuccess = false } = {} ) {
    if (forceSuccess) return;

    const { validations } = yield this.args.model.validate();
    let requiresOfferReload = false;
    if (validations.isValid) {
      const changedAttributes = this.args.model.changedAttributes();
      const fieldsToSyncWithInvoice = ['reference', 'comment'];
      for (let field of fieldsToSyncWithInvoice) {
        if (changedAttributes[field]) {
          const invoice = yield this.args.model.invoice;
          if (invoice) {
            debug(`Syncing ${field} of invoice with updated ${field} of order`);
            invoice[field] = this.args.model[field];
            yield invoice.save();
          }
          requiresOfferReload = true;
        }
      }

      yield this.args.model.save();

      if (requiresOfferReload)
        yield this.args.model.belongsTo('offer').reload();
    }

    // Save change of visitor
    const offer = yield this.args.model.offer;
    const request = yield offer.request;
    yield request.save();
  }).keepLatest()
  save;

  @task(function * () {
    try {
      yield this.documentGeneration.orderDocument(this.args.model);
    } catch(e) {
      warn(`Something went wrong while generating the order document`, { id: 'document-generation-failure' });
    }
  })
  generateOrderDocument;

  @task(function * () {
    try {
      yield this.documentGeneration.deliveryNote(this.args.model);
    } catch(e) {
      warn(`Something went wrong while generating the delivery note`, { id: 'document-generation-failure' });
    }
  })
  generateDeliveryNote;

  @action
  async closeEdit() {
    if (this.args.model.isNew || this.args.model.validations.isInvalid || this.args.model.isError
        || (this.save.last && this.save.last.isError)) {
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
    this.closeUnsavedChangesDialog();
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
