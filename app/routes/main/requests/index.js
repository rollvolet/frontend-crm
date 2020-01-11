import classic from 'ember-classic-decorator';
import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';

@classic
export default class IndexRoute extends Route.extend(DataTableRouteMixin) {
  modelName = 'request';

  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    // filter params
    number: { refreshModel: true },
    visitor: { refreshModel: true },
    withoutOffer: { refreshModel: true },
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
      include: 'customer,customer.honorific-prefix,building',
      filter: {
        number: params.number,
        visitor: params.visitor,
        offer: !params.withoutOffer,
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
