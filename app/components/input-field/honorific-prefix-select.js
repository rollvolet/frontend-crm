import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency';
import { trackedFunction } from 'ember-resources/util/function';
import constants from '../../config/constants';

const { CONCEPT_SCHEMES } = constants;
const fallbackLangTag = 'nl';

export default class HonorificPrefixSelect extends Component {
  @service store;

  @tracked honorificPrefixes = []; // list of Ember Data concept records

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    this.honorificPrefixes = yield this.store.queryAll('concept', {
      'filter[concept-schemes][:uri:]': CONCEPT_SCHEMES.HONORIFIC_PREFIXES,
      sort: 'position',
    });
  }

  get required() {
    return this.args.required || false;
  }

  get placeholder() {
    return this.required ? `${this.args.label} *` : this.args.label;
  }

  /** Selected honorific prefix Ember Data concept based on @value label */
  selectedValueData = trackedFunction(this, () => {
    if (this.args.value) {
      return this.honorificPrefixes.find((honorificPrefix) => {
        return honorificPrefix.langLabel.map((l) => l.content).includes(this.args.value);
      });
    } else {
      return null;
    }
  });

  get selectedValue() {
    return this.selectedValueData.value;
  }

  /** List of options for PowerSelect component containing labels in selected language */
  get options() {
    return this.honorificPrefixes.map((honorificPrefix) => {
      let label = honorificPrefix.langLabel.find((l) => l.language == this.languageTag);
      if (!label) {
        label = honorificPrefix.langLabel.find((l) => l.language == fallbackLangTag);
      }
      return { uri: honorificPrefix.uri, label: label.content };
    });
  }

  get selectedOption() {
    return this.options.find((opt) => opt.uri == this.selectedValue?.uri);
  }

  languageTagData = trackedFunction(this, async () => {
    const language = await this.args.language;
    return language.langTag;
  });

  get languageTag() {
    return this.languageTagData.value || fallbackLangTag;
  }

  @action
  selectOption(option) {
    this.args.onSelectionChange(option?.label);
  }
}
