import DataTableRoute from '../../../utils/data-table-route';
import onlyNumericChars from '../../../utils/only-numeric-chars';
import constants from '../../../config/constants';

const { CASE_STATUSES } = constants;

export default class MainOffersIndexRoute extends DataTableRoute {
  modelName = 'offer';

  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    // filter params
    visitor: { refreshModel: true },
    reference: { refreshModel: true },
    requestNumber: { refreshModel: true },
    hasOrder: { refreshModel: true },
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
    let caseStatus = undefined;
    if (params.isCancelled == 0) {
      caseStatus = CASE_STATUSES.ONGOING;
    } else if (params.isCancelled == 1) {
      caseStatus = CASE_STATUSES.CANCELLED;
    }

    const queryOptions = {
      include: 'case.customer.address,case.building.address,case.request.visitor',
      filter: {
        case: {
          status: caseStatus,
          reference: params.reference,
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
          request: {
            number: onlyNumericChars(params.requestNumber),
            visitor: {
              'first-name': params.visitor,
            },
          },
        },
      },
    };

    if (params.hasOrder == 0) {
      queryOptions.filter.case[':has-no:order'] = 't';
    } else if (params.hasOrder == 1) {
      queryOptions.filter.case[':has:order'] = 't';
    }

    return queryOptions;
  }
}
