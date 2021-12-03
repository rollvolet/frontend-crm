import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debug } from '@ember/debug';
import { guidFor } from '@ember/object/internals';
import { task } from 'ember-concurrency';

export default class OrderDetailPanelComponent extends Component {
  @service case;

  executionOptions = [
    { label: 'te leveren', value: 'delivery', id: `delivery-${guidFor(this)}` },
    { label: 'te plaatsen', value: 'installation', id: `installation-${guidFor(this)}` },
    { label: 'af te halen', value: 'pickup', id: `pickup-${guidFor(this)}` },
  ];

  @tracked editMode = false;

  get request() {
    return this.case.current && this.case.current.request;
  }

  get invoice() {
    return this.case.current && this.case.current.invoice;
  }

  get technicianNames() {
    return this.args.model.technicians.sortBy('firstName').mapBy('firstName');
  }

  get isNbOfPersonsWarning() {
    return this.args.model.scheduledNbOfPersons != 2;
  }

  @task
  *save() {
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

      if (requiresOfferReload) {
        yield this.args.model.belongsTo('offer').reload();
      }
    }

    const changedAttributesOnRequest = this.request.changedAttributes();
    if (changedAttributesOnRequest['visitor']) {
      yield this.request.save();
    }
  }

  @task
  *planEvent() {
    const changedAttributes = this.args.model.changedAttributes();
    if (changedAttributes['planningDate']) {
      yield this.args.model.save();
    }
  }

  @action
  setExecution(event) {
    const execution = event.target.value;
    this.args.model.mustBeInstalled = false;
    this.args.model.mustBeDelivered = false;

    if (execution == 'installation') {
      this.args.model.mustBeInstalled = true;
    } else if (execution == 'delivery') {
      this.args.model.mustBeDelivered = true;
    }
  }

  @action
  setCanceledStatus(value) {
    this.args.model.canceled = value;

    if (!value) {
      this.args.model.cancellationReason = null;
    }
  }

  @action
  setVisitor(visitor) {
    this.request.visitor = visitor ? visitor.firstName : null;
  }

  @action
  setTechnicians(employees) {
    this.args.model.technicians = employees;
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
