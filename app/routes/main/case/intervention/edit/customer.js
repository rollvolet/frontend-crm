import DataTableRoute from '../../../../../utils/data-table-route';

export default class MainCaseInterventionEditCustomerRoute extends DataTableRoute {
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

  setupController(controller) {
    super.setupController(...arguments);
    controller.case = this.modelFor('main.case');
    controller.intervention = this.modelFor('main.case.intervention.edit');
  }
}
