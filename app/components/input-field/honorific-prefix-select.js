import classic from 'ember-classic-decorator';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';
import Component from '@ember/component';
import { composeId } from '../../models/honorific-prefix';
import { proxyAware } from '../../utils/proxy-aware';

@classic
export default class HonorificPrefixSelect extends Component {
  @service
  store;

  @proxyAware('value')
  selected;

  async init() {
    super.init(...arguments);
    const prefixes = this.store.peekAll('honorific-prefix');
    this.set('honorificPrefixes', prefixes);
  }

  label = 'Aanspreektitel';
  value = null;
  language = null;
  onSelectionChange = null;

  @computed(
    'honorificPrefixes',
    'honorificPrefixes.[]',
    'language',
    'language.content'
  )
  get options() {
    if (this.honorificPrefixes && this.get('language.id')) {
      return this.honorificPrefixes.filter(p => {
        return p.name && p.languageId == this.get('language.id');
      });
    } else {
      return this.honorificPrefixes.filter(p => p.name);
    }
  }

  didUpdateAttrs() {
    super.didUpdateAttrs(...arguments);

    if (this.get('value.entityId') && this.get('language.id') && this.get('value.languageId') != this.get('language.id')) { // the language changed while a prefix has already been selected
      const honorificPrefix = this.honorificPrefixes.find(p => {
        // Find same prefix in the new language
        return p.get('id') == composeId(this.get('value.entityId'), this.get('language.id'));
      });
      next(this, function() {
        this.onSelectionChange(honorificPrefix);
      });
    }
  }
}
