import Route from '@ember/routing/route';
import Snapshot from '../../../utils/snapshot';
import search from '../../../utils/mu-search';
import MuSearchFilter from '../../../utils/mu-search-filter';
import onlyNumericChars from '../../../utils/only-numeric-chars';
import constants from '../../../config/constants';

const { CASE_STATUSES: STATUSES } = constants;

export default class MainDepositInvoicesIndexRoute extends Route {
  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    // filter params
    number: { refreshModel: true },
    requestNumber: { refreshModel: true },
    reference: { refreshModel: true },
    isCancelled: { refreshModel: true },
    name: { refreshModel: true },
    postalCode: { refreshModel: true },
    city: { refreshModel: true },
    street: { refreshModel: true },
    telephone: { refreshModel: true },
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
      ':prefix:searchNumber': onlyNumericChars(params.number),
      ':prefix:searchPostalCode': params.postalCode,
    });

    filter.setFilterFlag('case.status', params.isCancelled, STATUSES.CANCELLED, STATUSES.ONGOING);
    filter.ensureExistance('case.identifier');
    filter.setCaseIdentifierFilter('case.identifier', params.requestNumber);
    filter.setWildcardFilter('reference', params.reference);
    filter.setWildcardFilter('customer.name', params.name);
    filter.setWildcardFilter('searchStreet', params.street);
    filter.setWildcardFilter('searchCity', params.city);
    filter.setWildcardFilter('searchTelephones', params.telephone);

    const depositInvoices = await search(
      'deposit-invoices',
      params.page,
      params.size,
      params.sort,
      filter.value
    );

    this.lastParams.commit();

    return depositInvoices;
  }
}
