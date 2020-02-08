import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task, keepLatestTask } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debug, warn } from '@ember/debug';

export default class OfferPanelComponent extends Component {
  @service case
  @service documentGeneration
  @service router
  @service store

  @tracked offerlines = []
  @tracked showUnsavedChangesDialog = false

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    this.offerlines = yield this.args.model.load('offerlines');
    // No need to sideload the VAT rate of each offerlines, since they are included by default by the backend
  }

  get isDisabledEdit() {
    return this.args.model.isMasteredByAccess || this.case.current.order != null;
  }

  get isEnabledDelete() {
    return !this.isDisabledEdit;
  }

  get hasUnsavedChanges() {
    const offerlineWithUnsavedChanges = this.offerlines.find(o => o.isNew || o.validations.isInvalid || o.isError);
    return offerlineWithUnsavedChanges != null
        || this.args.model.isNew || this.args.model.validations.isInvalid || this.args.model.isError
        || (this.save.last && this.save.last.isError);
  }

  get hasMixedVatRates() {
    return this.offerlines.mapBy('vatRate').uniqBy('code').length > 1;
  }

  get request() {
    return this.case.current && this.case.current.request;
  }

  get order() {
    return this.case.current && this.case.current.order;
  }

  get invoice() {
    return this.case.current && this.case.current.invoice;
  }

  @task
  *rollbackTree() {
    const rollbackPromises = [];

    this.offerlines.forEach(offerline => {
      offerline.rollbackAttributes();
      rollbackPromises.push(offerline.belongsTo('vatRate').reload());
    });

    this.args.model.rollbackAttributes();
    rollbackPromises.push(this.args.model.belongsTo('vatRate').reload());

    yield all(rollbackPromises);
    yield this.save.perform(null, { forceSuccess: true });
  }

  @task
  *remove() {
    try {
      yield all(this.offerlines.map(t => t.destroyRecord()));
      yield this.args.model.destroyRecord();
      this.case.updateRecord('offer', null);
    } catch (e) {
      warn(`Something went wrong while destroying offer ${this.args.model.id}`, { id: 'destroy-failure' });
      // TODO rollback to detail view?
    } finally {
      this.router.transitionTo('main.case.request.edit', this.request.id);
    }
  }

  @task
  *save(_, { forceSuccess = false } = {} ) {
    if (forceSuccess) return;

    const { validations } = yield this.args.model.validate();
    let requiresOrderReload = false;
    if (validations.isValid) {
      const changedAttributes = this.args.model.changedAttributes();
      const fieldsToSyncWithInvoice = ['reference', 'comment'];
      for (let field of fieldsToSyncWithInvoice) {
        if (changedAttributes[field]) {
          if (this.invoice) {
            debug(`Syncing ${field} of invoice with updated ${field} of offer`);
            this.invoice[field] = this.model[field];
            yield this.invoice.save();
          }
          requiresOrderReload = true;
        }
      }
      yield this.args.model.save();

      if (requiresOrderReload)
        yield this.args.model.belongsTo('order').reload();
    }

    const changedAttributesOnRequest = this.request.changedAttributes();
    if (changedAttributesOnRequest['visitor'])
      yield this.request.save();
  }

  @task
  *generateOfferDocument() {
    const oldOfferDate = this.args.model.offerDate;
    try {
      this.args.model.offerDate = new Date();
      yield this.save.perform();
      yield this.documentGeneration.offerDocument(this.args.model);
    } catch(e) {
      warn(`Something went wrong while generating the offer document`, { id: 'document-generation-failure' });
      this.args.model.offerDate = oldOfferDate;
      yield this.save.perform();
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
  downloadOfferDocument() {
    this.documentGeneration.downloadOfferDocument(this.args.model);
  }
}
