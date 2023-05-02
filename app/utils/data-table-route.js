import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';

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

  async model(params) {
    // TODO remove filter on telephone-number workaround once all resources
    // have been moved to the triplestore
    // Note: search by telephone only works if at least 5 digits are given
    if (isPresent(params.telephone) && params.telephone.length > 4) {
      params.telephone = await this.fetchCustomerIdsForTelephone(params.telephone);
    }
    if (isPresent(params.cTelephone) && params.cTelephone.length > 4) {
      params.cTelephone = await this.fetchCustomerIdsForTelephone(params.cTelephone);
    }

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

  /* @private */
  async fetchCustomerIdsForTelephone(telephoneParam) {
    // First search all customers for a given phone number.
    const telephoneFilter = telephoneParam.replace(/\D/g, '');
    const telephones = await this.store.query('telephone', {
      'filter[value]': telephoneFilter,
      'filter[customer]': 'http://data.rollvolet.be/customers/', // exclude contact/building
      page: {
        size: 200,
      },
    });
    // Next, add the customer IDs as telephone filter on the query to the SQL store.
    if (telephones.length) {
      const ids = await Promise.all(
        telephones.map(async (tel) => {
          const uri = tel.customer;
          const number = uri.slice(uri.lastIndexOf('/') + 1);
          const customer = await this.store.findRecord('customer', number);
          return customer.dataId;
        })
      );
      return ids.filter((id) => isPresent(id)).join(',');
    } else {
      // Use an empty string if no phone-numbers are found, to distinguish in backend
      // between no-filter and non-matching filter.
      return '';
    }
  }
}
