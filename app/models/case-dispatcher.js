import { tracked } from '@glimmer/tracking';
import { all, keepLatestTask } from 'ember-concurrency';

function getLegacyIdFromUri(uri) {
  if (uri && uri.includes('/')) {
    return uri.slice(uri.lastIndexOf('/') + 1);
  } else {
    return null;
  }
}

export default class CaseDispatcher {
  @tracked case;

  @tracked customer = null;
  @tracked contact = null;
  @tracked building = null;
  @tracked request = null;
  @tracked intervention = null;
  @tracked offer = null;
  @tracked order = null;
  @tracked invoice = null;

  constructor(_case, fetchRecord) {
    this.case = _case;
    this.fetchRecord = fetchRecord;
  }

  @keepLatestTask()
  *loadRelatedRecords() {
    // TODO add deposit-invoices
    const loadRelatedRecords = [
      'customer',
      'contact',
      'building',
      'request',
      'intervention',
      'offer',
      'order',
      'invoice',
    ].map(async (type) => {
      const currentUri = this.case[type];
      if (currentUri) {
        await this.ensureFreshRecord(type);
      } else {
        this[type] = null;
      }
    });

    yield all(loadRelatedRecords);
  }

  async ensureFreshRecord(type) {
    const recordIsFresh = function (id, resource) {
      return id && resource && id == resource.id;
    };

    const currentUri = this.case[type];
    const currentResource = this[type];
    const currentId = getLegacyIdFromUri(currentUri);

    if (!recordIsFresh(currentId, currentResource)) {
      this[type] = await this.fetchRecord(type, currentId);
    }
  }

  async updateRecord(type, record) {
    if (record) {
      this.case[type] = record.uri;
      await this.case.save();
      this[type] = record;
    } else {
      this.case[type] = null;
      await this.case.save();
      this[type] = null;
    }
  }

  async unlinkCustomer() {
    const customerEntities = ['customer', 'contact', 'building'];
    customerEntities.forEach((type) => {
      this.case[type] = null;
      this[type] = null;
    });
    await this.case.save();

    if (this.request) {
      customerEntities.forEach((type) => {
        this.request[type] = null;
      });
      await this.request.save();
    } else if (this.intervention) {
      customerEntities.forEach((type) => {
        this.intervention[type] = null;
      });
      await this.intervention.save();
    }
  }
}
