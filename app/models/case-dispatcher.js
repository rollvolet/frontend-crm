import { tracked } from '@glimmer/tracking';
import { all, keepLatestTask } from 'ember-concurrency';

function getLegacyIdFromUri(uri) {
  if (uri && uri.includes('/')) {
    return uri.slice(uri.lastIndexOf('/') + 1);
  } else {
    return null;
  }
}

/**
 * Dispatcher for a case containing all related resources as Ember Data records.
 * This class is an intermediate as long as the related resources are a mix of
 * SQL and triplestore resources, respectively fetched from the monolith backend
 * or the triplestore.
 * The 'case' Ember Data record contains URIs as attribute for the the records that still reside
 * in the SQL DB.
 * Once all resources are refactored to the triplestore, this class becomes void,
 * as the 'case' record will contain relations to all related resources.
 */
export default class CaseDispatcher {
  @tracked case; // Ember Data case record

  // Fetched from SQL DB
  @tracked customer = null;
  @tracked contact = null;
  @tracked building = null;
  @tracked request = null;
  @tracked intervention = null;
  @tracked offer = null;
  @tracked order = null;

  constructor(_case, fetchRecord) {
    this.case = _case;
    this.fetchRecord = fetchRecord;
  }

  @keepLatestTask()
  *loadRelatedRecords() {
    const loadRelatedRecords = [
      'customer',
      'contact',
      'building',
      'request',
      'intervention',
      'offer',
      'order',
    ].map(async (type) => {
      const currentUri = this.case[type];
      if (currentUri) {
        await this.ensureFreshRecord(type);
      } else {
        this[type] = null;
      }
    });

    // Regular Ember Data relationships
    const loadRelations = ['invoice', 'depositInvoices'].map((type) => this.case[type]);

    yield all([...loadRelatedRecords, ...loadRelations]);
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
