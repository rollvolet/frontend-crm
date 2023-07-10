import DataTableRoute from '../../../utils/data-table-route';
import onlyNumericChars from '../../../utils/only-numeric-chars';
import constants from '../../../config/constants';

const { CASE_STATUSES } = constants;

export default class MainRequestsIndexRoute extends DataTableRoute {
  modelName = 'request';

  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    // filter params
    number: { refreshModel: true },
    visitor: { refreshModel: true },
    reference: { refreshModel: true },
    hasOffer: { refreshModel: true },
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
      include: 'case.customer.address,case.building.address,visitor',
      filter: {
        number: onlyNumericChars(params.number),
        visitor: {
          'first-name': params.visitor,
        },
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
        },
      },
    };

    if (params.hasOffer == 0) {
      queryOptions.filter.case[':has-no:offer'] = 't';
    } else if (params.hasOffer == 1) {
      queryOptions.filter.case[':has:offer'] = 't';
    }

    return queryOptions;
  }
}
