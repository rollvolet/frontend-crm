import DataTableRoute from '../../../utils/data-table-route';
import onlyNumericChars from '../../../utils/only-numeric-chars';
import formatOfferNumber from '../../../utils/format-offer-number';

export default class MainOrdersIndexRoute extends DataTableRoute {
  modelName = 'order';

  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    // filter params
    offerNumber: { refreshModel: true },
    requestNumber: { refreshModel: true },
    visitor: { refreshModel: true },
    reference: { refreshModel: true },
    hasInvoice: { refreshModel: true },
    isCancelled: { refreshModel: true },
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
      include: 'customer,customer.honorific-prefix,building,offer',
      filter: {
        'request-number': onlyNumericChars(params.requestNumber),
        'offer-number': formatOfferNumber(params.offerNumber),
        reference: params.reference,
        isCancelled: params.isCancelled,
        hasInvoice: params.hasInvoice,
        offer: {
          request: {
            visitor: params.visitor,
          },
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
