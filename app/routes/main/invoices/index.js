import classic from 'ember-classic-decorator';
import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';

@classic
export default class IndexRoute extends Route.extend(DataTableRouteMixin) {
  modelName = 'invoice';

  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    // filter params
    number: { refreshModel: true },
    requestNumber: { refreshModel: true },
    offerNumber: { refreshModel: true },
    reference: { refreshModel: true },
    cName: { refreshModel: true },
    cPostalCode: { refreshModel: true },
    cCity: { refreshModel: true },
    cStreet: { refreshModel: true },
    cTelephone: { refreshModel: true },
    bName: { refreshModel: true },
    bPostalCode: { refreshModel: true },
    bCity: { refreshModel: true },
    bStreet: { refreshModel: true }
  };

  mergeQueryOptions(params) {
    return {
      // Building and contact must already be included
      // such that correct values can be set in the case controller when opening the detail
      include: 'customer,customer.honorific-prefix,order,building,contact',
      filter: {
        number: params.number,
        reference: params.reference,
        offer: {
          number: params.offerNumber,
          'request-number': params.requestNumber
        },
        customer: {
          name: params.cName,
          'postal-code': params.cPostalCode,
          city: params.cCity,
          street: params.cStreet,
          telephone: params.cTelephone
        },
        building: {
          name: params.bName,
          'postal-code': params.bPostalCode,
          city: params.bCity,
          street: params.bStreet
        }
      }
    };
  }
}
