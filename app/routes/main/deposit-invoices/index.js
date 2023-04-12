import DataTableRoute from '../../../utils/data-table-route';
import onlyNumericChars from '../../../utils/only-numeric-chars';
import constants from '../../../config/constants';

const { INVOICE_TYPES } = constants;

export default class MainDepositInvoicesIndexRoute extends DataTableRoute {
  modelName = 'invoice';

  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    // filter params
    number: { refreshModel: true },
    requestNumber: { refreshModel: true },
    reference: { refreshModel: true },
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
      include: ['customer.address.country', 'building.address.country', 'case'].join(','),
      filter: {
        type: INVOICE_TYPES.DEPOSIT_INVOICE,
        number: onlyNumericChars(params.number),
        reference: params.reference,
        case: {
          identifier: onlyNumericChars(params.requestNumber),
        },
        customer: {
          name: params.cName,
          address: {
            'postal-code': params.cPostalCode,
            city: params.cCity,
            street: params.cStreet,
          },
          telephone: params.cTelephone,
        },
        building: {
          name: params.bName,
          address: {
            'postal-code': params.bPostalCode,
            city: params.bCity,
            street: params.bStreet,
          },
        },
      },
    };
  }
}
