import classic from 'ember-classic-decorator';
import Route from '@ember/routing/route';

@classic
export default class EditRoute extends Route {
  model(params) {
    return this.store.findRecord('customer', params.customer_id, {
      // don't include telephones here. Telephones need to be retrieved in a separate request
      // so we can include the telephone types in them
      include: 'honorific-prefix'
    });
  }
}
