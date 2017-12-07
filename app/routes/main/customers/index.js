import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';

export default Route.extend(DataTableRouteMixin, {
  modelName: 'customer',
  queryParams: {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    // filter params
    number: { refreshModel: true },
    name: { refreshModel: true },
    postalCode: { refreshModel: true },
    city: { refreshModel: true },
    street: { refreshModel: true }
  },
  mergeQueryOptions(params) {
    return {
      include: 'language,country,honorific-prefix',
      filter: {
        number: params.number,
        name: params.name,
        'postal-code': params.postalCode,
        city: params.city,
        street: params.street,
      }
    };
  }
});
