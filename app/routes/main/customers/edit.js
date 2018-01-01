import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.get('store').findRecord('customer', params.customer_id, {
      // don't include telephones here. Telephones need to be retrieved in a separate request
      // so we can include the telephone types in them
      include: 'language,country,honorific-prefix,tags'
    });
  }
});
