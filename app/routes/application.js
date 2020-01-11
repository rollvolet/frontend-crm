import classic from 'ember-classic-decorator';
import Route from '@ember/routing/route';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

@classic
export default class ApplicationRoute extends Route.extend(ApplicationRouteMixin) {}
