import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.get('store').findRecord('customer', params.customer_id, {
      include: 'postal-code,language,country,honorific-prefix,telephones'
    });
  }
});
