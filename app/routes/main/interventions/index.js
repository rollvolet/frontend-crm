import DataTableRoute from '../../../utils/data-table-route';
import onlyNumericChars from '../../../utils/only-numeric-chars';
import constants from '../../../config/constants';

const { CASE_STATUSES } = constants;

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
    let caseStatus = undefined;
    if (params.isCancelled == 0) {
      caseStatus = CASE_STATUSES.ONGOING;
    } else if (params.isCancelled == 1) {
      caseStatus = CASE_STATUSES.CANCELLED;
    }

    const queryOptions = {
      include: 'case.customer.address,case.building.address,visit',
      filter: {
        number: onlyNumericChars(params.number),
        case: {
          status: caseStatus,
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

    if (params.hasInvoice == 0) {
      queryOptions.filter.case[':has-no:invoice'] = 't';
    } else if (params.hasInvoice == 1) {
      queryOptions.filter.case[':has:invoice'] = 't';
    }

    if (params.isPlanned == 0) {
      queryOptions.filter[':has-no:visit'] = 't';
    } else if (params.isPlanned == 1) {
      queryOptions.filter[':has:visit'] = 't';
    }

    return queryOptions;
  }
}
