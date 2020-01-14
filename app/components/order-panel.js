import classic from 'ember-classic-decorator';
import Component from '@ember/component';
import { action, computed } from '@ember/object';
import { on } from '@ember-decorators/object';
import { task, all } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { debug, warn } from '@ember/debug';
import { EKMixin, keyUp } from 'ember-keyboard';
import { and, or, bool, not, notEmpty, raw, sum, array, promise } from 'ember-awesome-macros';
import { add } from 'ember-math-helpers/helpers/add';

@classic
export default class OrderPanel extends Component.extend(EKMixin) {
  @service case;
  @service documentGeneration;
  @service router;
  @service store;

  model = null;
  editMode = false;
  onOpenEdit = null;
  onCloseEdit = null;
  showUnsavedChangesDialog = false;

  @notEmpty('model.invoice.id') hasInvoice
  @bool('model.depositInvoices.length') hasDepositInvoice
  @bool('model.deposits.length') hasDeposit
  @or('model.isMasteredByAccess', 'hasInvoice') isDisabledEdit
  @and(not('isDisabledEdit'), not('hasDepositInvoice'), not('hasDeposit')) isEnabledDelete
  @promise.array('model.invoicelines') invoicelines
  @sum(array.mapBy('invoicelines', raw('arithmeticAmount'))) totalAmount

  @computed('invoicelines.@each.arithmeticVat')
  get totalVat() {
    return (async () => {
      const vats = await Promise.all(this.invoicelines.map(i => i.arithmeticVat))
      return add(vats);
    })();
  }

  init() {
    super.init(...arguments);
    this.set('keyboardActivated', true); // required for ember-keyboard
  }

  @task(function * () {
    const offer = yield this.model.offer;
    try {
      // remove invoicelines
      yield all(this.invoicelines.map(l => l.destroyRecord()));

      // update case-tabs
      this.case.updateRecord('order', null);

      // delete order
      yield this.model.destroyRecord();
      // TODO: Fix this hack when Ember Data allows creation of already deleted ID
      // See https://github.com/emberjs/data/issues/5006
      // this.store._removeFromIdMap(this.model._internalModel);

      this.router.transitionTo('main.case.offer.edit', offer);
    } catch (e) {
      warn(`Something went wrong while destroying order ${this.model.id}`, { id: 'destroy-failure' });

      offer.set('order', this.model);
      yield offer.save();
      this.case.set('current.orderId', this.model.id);
      yield this.model.rollbackAttributes(); // undo delete-state
    }
  })
  remove;

  @task(function * () {
    this.model.rollbackAttributes();
    const rollbackPromises = [];
    rollbackPromises.push(this.model.belongsTo('vatRate').reload());
    rollbackPromises.push(this.model.belongsTo('contact').reload());
    rollbackPromises.push(this.model.belongsTo('building').reload());
    yield all(rollbackPromises);
    yield this.save.perform(null, { forceSuccess: true });
  })
  rollbackTree;

  @task(function * (_, { forceSuccess = false } = {} ) {
    if (forceSuccess) return;

    const { validations } = yield this.model.validate();
    let requiresOfferReload = false;
    if (validations.isValid) {
      const changedAttributes = this.model.changedAttributes();
      const fieldsToSyncWithInvoice = ['reference', 'comment'];
      for (let field of fieldsToSyncWithInvoice) {
        if (changedAttributes[field]) {
          const invoice = yield this.model.invoice;
          if (invoice) {
            debug(`Syncing ${field} of invoice with updated ${field} of order`);
            invoice.set(field, this.model.get(field));
            yield invoice.save();
          }
          requiresOfferReload = true;
        }
      }

      yield this.model.save();

      if (requiresOfferReload)
        yield this.model.belongsTo('offer').reload();
    }

    // Save change of visitor
    const offer = yield this.model.offer;
    const request = yield offer.request;
    yield request.save();
  }).keepLatest()
  save;

  @task(function * () {
    try {
      yield this.documentGeneration.orderDocument(this.model);
    } catch(e) {
      warn(`Something went wrong while generating the order document`, { id: 'document-generation-failure' });
    }
  })
  generateOrderDocument;

  @task(function * () {
    try {
      yield this.documentGeneration.deliveryNote(this.model);
    } catch(e) {
      warn(`Something went wrong while generating the delivery note`, { id: 'document-generation-failure' });
    }
  })
  generateDeliveryNote;

  // eslint-disable-next-line ember/no-on-calls-in-components
  @on(keyUp('ctrl+alt+KeyU'))
  openEditByShortcut() {
    this.onOpenEdit();
  }

  @action
  openEdit() {
    this.onOpenEdit();
  }

  @action
  async closeEdit() {
    if (this.model.isNew || this.model.validations.isInvalid || this.model.isError
        || (this.save.last && this.save.last.isError)) {
      this.set('showUnsavedChangesDialog', true);
    } else {
      this.onCloseEdit();
    }
  }

  @action
  closeUnsavedChangesDialog() {
    this.set('showUnsavedChangesDialog', false);
  }

  @action
  async confirmCloseEdit() {
    this.closeUnsavedChangesDialog();
    this.rollbackTree.perform();
    this.onCloseEdit();
  }

  @action
  downloadOrderDocument() {
    this.documentGeneration.downloadOrderDocument(this.model);
  }

  @action
  downloadDeliveryNote() {
    this.documentGeneration.downloadDeliveryNote(this.model);
  }
}
