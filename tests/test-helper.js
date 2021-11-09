import Application from 'rollvolet-crm/app';
import config from 'rollvolet-crm/config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

setApplication(Application.create(config.APP));

start();
