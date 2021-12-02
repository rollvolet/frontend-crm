import Route from '@ember/routing/route';

export default class CaseRoute extends Route {
  model(params) {
    return this.store.loadRecord('customer', params.customer_id, {
      // telephones are not included but retrieved through a separate request
      // because telephone types need to be included
      include: 'honorific-prefix',
    });
  }
}
