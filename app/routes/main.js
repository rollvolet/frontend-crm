import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';
import { debug } from '@ember/debug';

export default Route.extend(AuthenticatedRouteMixin, {
  configuration: service(),

  afterModel() {
    debug('Preloading static lists');
    return this.configuration.preloadStaticLists();
  }
});
