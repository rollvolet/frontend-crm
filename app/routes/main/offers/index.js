import DataTableRoute from '../../../utils/data-table-route';
import onlyNumericChars from '../../../utils/only-numeric-chars';

export default class MainOffersIndexRoute extends DataTableRoute {
  modelName = 'offer';

  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    // filter params
    number: { refreshModel: true },
    visitor: { refreshModel: true },
    reference: { refreshModel: true },
    requestNumber: { refreshModel: true },
    withoutOrder: { refreshModel: true },
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
      include: 'customer,customer.honorific-prefix,building,request',
      filter: {
        number: params.number,
        'request-number': onlyNumericChars(params.requestNumber),
        reference: params.reference,
        order: !params.withoutOrder,
        request: {
          visitor: params.visitor,
        },
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
