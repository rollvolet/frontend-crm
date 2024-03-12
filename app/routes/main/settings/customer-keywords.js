import Route from '@ember/routing/route';
import { service } from '@ember/service';
import constants from '../../../config/constants';

const { CONCEPT_SCHEMES } = constants;

export default class MainSettingsCustomerKeywordsRoute extends Route {
  @service store;

  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  model(params) {
    return this.store.query('concept', {
      page: {
        size: params.size,
        number: params.page,
      },
      sort: params.sort,
      'filter[concept-schemes][:uri:]': CONCEPT_SCHEMES.CUSTOMER_KEYWORDS,
    });
  }
}
