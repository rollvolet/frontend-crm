import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.store.findRecord('customer', params.customer_id, {
      // telephones are not included but retrieved through a separate request
      // because telephone types need to be included
      include: 'honorific-prefix'
    });
  }
});
