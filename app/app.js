import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'rollvolet-crm/config/environment';
import flatpickr from 'flatpickr';
import lang from 'flatpickr/dist/l10n';
import setupGlitchtip from './utils/glitchtip';

setupGlitchtip();
flatpickr.localize(lang.nl);

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);
