import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

// Inspired by the Route mixin of mu-semtech/ember-data-table
export default class DataTableRoute extends Route {
  @service store;

  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    filter: { refreshModel: true },
  };

  mergeQueryOptions() {
    return {};
  }

  model(params) {
    let options = {
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
    };
    // sending an empty filter param to backend returns []
    if (params.filter) {
      options['filter'] = params.filter;
    }
    options = Object.assign(options, this.mergeQueryOptions(params));
    return this.store.query(this.modelName, options);
  }

  @action
  loading(transition) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor(this.routeName);
    controller.set('isLoadingModel', true);
    transition.promise.finally(function () {
      controller.set('isLoadingModel', false);
    });

    return true; // bubble the loading event
  }
}
