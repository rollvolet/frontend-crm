import DataTableRoute from '../../../utils/data-table-route';
import onlyNumericChars from '../../../utils/only-numeric-chars';

export default class MainInterventionsIndexRoute extends DataTableRoute {
  modelName = 'intervention';

  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    // filter params
    number: { refreshModel: true },
    hasInvoice: { refreshModel: true },
    isCancelled: { refreshModel: true },
    isPlanned: { refreshModel: true },
    cName: { refreshModel: true },
    cPostalCode: { refreshModel: true },
    cCity: { refreshModel: true },
    cStreet: { refreshModel: true },
    cTelephone: { refreshModel: true },
    bName: { refreshModel: true },
    bPostalCode: { refreshModel: true },
    bCity: { refreshModel: true },
    bStreet: { refreshModel: true },
  };

  mergeQueryOptions(params) {
    return {
      include: 'customer,customer.honorific-prefix,building',
      filter: {
        number: onlyNumericChars(params.number),
        isCancelled: params.isCancelled,
        hasInvoice: params.hasInvoice,
        isPlanned: params.isPlanned,
        customer: {
          name: params.cName,
          'postal-code': params.cPostalCode,
          city: params.cCity,
          street: params.cStreet,
          telephone: params.cTelephone,
        },
        building: {
          name: params.bName,
          'postal-code': params.bPostalCode,
          city: params.bCity,
          street: params.bStreet,
        },
      },
    };
  }
}
