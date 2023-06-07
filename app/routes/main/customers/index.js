import DataTableRoute from '../../../utils/data-table-route';
import onlyNumericChars from '../../../utils/only-numeric-chars';

export default class MainCustomersIndexRoute extends DataTableRoute {
  modelName = 'customer';

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
  };

  mergeQueryOptions(params) {
    return {
      include: 'address',
      filter: {
        number: onlyNumericChars(params.number),
        name: params.name,
        address: {
          'postal-code': params.postalCode,
          city: params.city,
          street: params.street,
        },
        telephones: {
          value: onlyNumericChars(params.telephone),
        },
      },
    };
  }
}
