import { warn } from '@ember/debug';
import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked, cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { updateCalendarEvent } from '../../utils/calendar-helpers';

export default class CaseCustomerPanelComponent extends Component {
  @service router;

  @tracked isCommentExpanded = false;
  @tracked isMemoExpanded = false;
  @tracked isEnabledEditBuilding = false;
  @tracked isEnabledEditContact = false;

  get isUpdatingContact() {
    return this.updateContact.isRunning;
  }

  get isUpdatingBuilding() {
    return this.updateBuilding.isRunning;
  }

  @cached
  get caseSteps() {
    const promise = (async () => {
      const [request, offer, intervention, invoice] = await Promise.all([
        this.args.model.request,
        this.args.model.offer,
        this.args.model.intervention,
        this.args.model.invoice,
      ]);

      return { request, offer, intervention, invoice };
    })();
    return new TrackedAsyncData(promise);
  }

  get isRequestWithoutOffer() {
    if (this.caseSteps.isResolved) {
      const { request, offer } = this.caseSteps.value;
      return request != null && offer == null;
    } else {
      return false;
    }
  }

  get isInterventionWithoutInvoice() {
    if (this.caseSteps.isResolved) {
      const { intervention, invoice } = this.caseSteps.value;
      return intervention != null && invoice == null;
    } else {
      return false;
    }
  }

  get isEnabledUnlinkCustomer() {
    return (
      this.args.model.isOngoing && (this.isRequestWithoutOffer || this.isInterventionWithoutInvoice)
    );
  }

  @task
  *unlinkCustomer() {
    const [request, offer, intervention, invoice] = yield Promise.all([
      this.args.model.request,
      this.args.model.offer,
      this.args.model.intervention,
      this.args.model.invoice,
    ]);

    if (request) {
      if (offer) {
        warn(`Unable to unlink customer from request. Case has an offer already.`);
      } else {
        try {
          const visit = yield request.visit;
          if (visit) {
            yield visit.destroyRecord();
          }
        } catch (e) {
          // silently ignore calendar event error
        }
      }
    } else if (intervention) {
      if (invoice) {
        warn(`Unable to unlink customer from intervention. Case has an invoice already.`);
      } else {
        try {
          const visit = yield intervention.visit;
          if (visit) {
            yield visit.destroyRecord();
          }
        } catch (e) {
          // silently ignore calendar event error
        }
      }
    }

    this.args.model.customer = null;
    this.args.model.building = null;
    this.args.model.contact = null;
    yield this.args.model.save();

    if (request) {
      this.router.transitionTo('main.case.request.edit.index', this.args.model.id, request.id);
    } else if (intervention) {
      this.router.transitionTo(
        'main.case.intervention.edit.index',
        this.args.model.id,
        intervention.id
      );
    }
  }

  @action
  toggleComment() {
    this.isCommentExpanded = !this.isCommentExpanded;
  }

  @action
  toggleMemo() {
    this.isMemoExpanded = !this.isMemoExpanded;
  }

  @action
  toggleContactEdit() {
    this.isEnabledEditContact = !this.isEnabledEditContact;
  }

  @action
  toggleBuildingEdit() {
    this.isEnabledEditBuilding = !this.isEnabledEditBuilding;
  }

  @task
  *updateContact(contact) {
    this.isEnabledEditContact = false;
    this.args.model.contact = contact;
    yield this.args.model.save();
    yield this.syncCalendarEvents.perform();
  }

  @task
  *updateBuilding(building) {
    this.isEnabledEditBuilding = false;
    this.args.model.building = building;
    yield this.args.model.save();
    yield this.syncCalendarEvents.perform();
  }

  @task
  *syncCalendarEvents() {
    const [request, intervention, order] = yield Promise.all([
      this.args.model.request,
      this.args.model.intervention,
      this.args.model.order,
    ]);

    yield updateCalendarEvent({ request, intervention, order });
  }
}
