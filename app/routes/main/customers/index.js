import Route from '@ember/routing/route';
import Snapshot from '../../../utils/snapshot';
import search from '../../../utils/mu-search';
import MuSearchFilter from '../../../utils/mu-search-filter';
import constants from '../../../config/constants';

const { CUSTOMER_STATUSES } = constants;

export default class MainCustomersIndexRoute extends Route {
  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    // filter params
    number: { refreshModel: true },
    name: { refreshModel: true },
    postalCode: { refreshModel: true },
    city: { refreshModel: true },
    street: { refreshModel: true },
    telephone: { refreshModel: true },
    onlyActive: { refreshModel: true },
  };

  constructor() {
    super(...arguments);
    this.lastParams = new Snapshot();
  }

  async model(params) {
    this.lastParams.stageLive(params);

    // Reset page number if any of the filters has changed
    const paramHasChanged = this.lastParams.anyFieldChanged(
      Object.keys(params).filter((key) => key !== 'page')
    );
    if (paramHasChanged) {
      params.page = 0;
    }

    const filter = new MuSearchFilter({
      ':prefix:searchNumber': params.number,
      ':prefix:searchPostalCode': params.postalCode,
    });

    if (params.onlyActive) {
      filter.set('status', CUSTOMER_STATUSES.ACTIVE);
    }
    filter.setWildcardFilter('name', params.name);
    filter.setWildcardFilter('searchStreet', params.street);
    filter.setWildcardFilter('searchCity', params.city);
    filter.setWildcardFilter('searchTelephones', params.telephone?.replace(/\D/g, ''));

    const customers = await search(
      'customers',
      params.page,
      params.size,
      params.sort,
      filter.value
    );

    this.lastParams.commit();

    return customers;
  }
}
