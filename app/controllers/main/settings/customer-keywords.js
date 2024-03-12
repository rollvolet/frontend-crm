import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import constants from '../../../config/constants';

const { CONCEPT_SCHEMES } = constants;

export default class MainSettingsCustomerKeywordsController extends Controller {
  @service router;
  @service store;

  @tracked page = 0;
  @tracked size = 50;
  @tracked sort = 'label';

  @action
  async addKeyword(label) {
    const conceptScheme = await this.store.findRecordByUri(
      'concept-scheme',
      CONCEPT_SCHEMES.CUSTOMER_KEYWORDS
    );
    const keyword = this.store.createRecord('concept', {
      label,
      conceptSchemes: [conceptScheme],
      topConceptSchemes: [conceptScheme],
    });
    await keyword.save();
    this.router.refresh('main.settings.customer-keywords');
  }

  @action
  async deleteKeyword(keyword) {
    await keyword.destroyRecord();
    this.router.refresh('main.settings.customer-keywords');
  }

  @action
  previousPage() {
    this.selectPage(this.page - 1);
  }

  @action
  nextPage() {
    this.selectPage(this.page + 1);
  }

  @action
  selectPage(page) {
    this.page = page;
  }
}
