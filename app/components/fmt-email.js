import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: '',

  value: null,

  href: computed('value', function() {
    return `mailto:${this.value}`;
  })
});
