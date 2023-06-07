import DataTableRoute from '../../../utils/data-table-route';
import onlyNumericChars from '../../../utils/only-numeric-chars';
import formatOfferNumber from '../../../utils/format-offer-number';
import config from '../../../config/constants';

const { CASE_STATUSES } = config;

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
    const q = {
      include: 'case',
      filter: {
        case: {
          identifier: onlyNumericChars(params.requestNumber),
          reference: params.reference,
          request: {
            visitor: params.visitor,
          },
          offer: {
            number: formatOfferNumber(params.offerNumber),
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
      },
    };

    if (params.isCancelled == 0) {
      q['filter[case][status]'] = CASE_STATUSES.ONGOING;
    } else if (params.isCancelled == 1) {
      q['filter[case][status]'] = CASE_STATUSES.CANCELLED;
    } // else -1: ignore filter

    if (params.hasInvoice == 0) {
      q['filter[case][:has-no:invoice]'] = true;
    } else if (params.hasInvoice == 1) {
      q['filter[case][:has:invoice]'] = true;
    } // else -1: ignore filter

    return q;
  }
}
