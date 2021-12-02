import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';

export default class CustomerRoute extends Route.extend(DataTableRouteMixin) {
  modelName = 'customer';

  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    // filter params
    number: { refreshModel: true },
    name: { refreshModel: true },
    postalCode: { refreshModel: true },
    city: { refreshModel: true },
    street: { refreshModel: true },
    telephone: { refreshModel: true },
  };

  mergeQueryOptions(params) {
    return {
      include: 'honorific-prefix',
      filter: {
        number: params.number,
        name: params.name,
        'postal-code': params.postalCode,
        city: params.city,
        street: params.street,
        telephone: params.telephone,
      },
    };
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    const request = this.modelFor('main.requests.edit');
    controller.set('request', request);
  }
}
