import EmberObject from '@ember/object';
import DebouncedSearchTaskMixin from 'rollvolet-crm/mixins/debounced-search-task';
import { module, test } from 'qunit';

module('Unit | Mixin | debounced search task');

// Replace this with your real tests.
test('it works', function(assert) {
  let DebouncedSearchTaskObject = EmberObject.extend(DebouncedSearchTaskMixin);
  let subject = DebouncedSearchTaskObject.create();
  assert.ok(subject);
});
