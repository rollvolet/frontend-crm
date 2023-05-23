import ApplicationSerializer from './application';
import classic from 'ember-classic-decorator';

@classic
export default class LanguageSerializer extends ApplicationSerializer {
  normalize(typeClass, hash) {
    // TODO remove legacy ID conversion once languages are fully migrated to triplestore
    if (hash['attributes']['identifier']) {
      const uuid = hash['id'];
      hash['attributes']['uuid'] = uuid;
      hash['id'] = hash['attributes']['identifier']; // legacy ID from SQL DB
    }
    return super.normalize(...arguments);
  }
}
