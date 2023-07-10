import DataTableRoute from '../../../utils/data-table-route';
import onlyNumericChars from '../../../utils/only-numeric-chars';
import constants from '../../../config/constants';

const { CASE_STATUSES } = constants;

export default class MainInvoicesIndexRoute extends DataTableRoute {
  modelName = 'invoice';

  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    // filter params
    number: { refreshModel: true },
    caseIdentifier: { refreshModel: true },
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
    isCancelled: { refreshModel: true },
  };

  mergeQueryOptions(params) {
    let caseStatus = undefined;
    if (params.isCancelled == 0) {
      caseStatus = CASE_STATUSES.ONGOING;
    } else if (params.isCancelled == 1) {
      caseStatus = CASE_STATUSES.CANCELLED;
    }

    const queryOptions = {
      include: 'customer.address.country,building.address.country,case',
      filter: {
        number: onlyNumericChars(params.number),
        case: {
          status: caseStatus,
          reference: params.reference,
          identifier: params.caseIdentifier,
          request: {
            visitor: {
              'first-name': params.visitor,
            },
          },
        },
        customer: {
          name: params.cName,
          address: {
            street: params.cStreet,
            'postal-code': params.cPostalCode,
            city: params.cCity,
          },
          telephones: {
            value: params.cTelephone,
          },
        },
        building: {
          name: params.bName,
          address: {
            street: params.bStreet,
            'postal-code': params.bPostalCode,
            city: params.bCity,
          },
        },
      },
    };

    return queryOptions;
  }
}
