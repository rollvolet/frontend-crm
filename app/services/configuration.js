import Service, { inject as service } from '@ember/service';
import { all } from 'rsvp';

export default Service.extend({
  store: service(),
  preloadStaticLists() {
    const entities = [
      'country',
      'honorific-prefix',
      'language',
      'postal-code',
      'telephone-type'
    ];
    return all(entities.map(e => this.store.findAll(e)));
  }
});
