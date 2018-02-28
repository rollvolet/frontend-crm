import EmberObject from '@ember/object';
import ReduceFunctionsMixin from 'rollvolet-crm/mixins/reduce-functions';
import { module, test } from 'qunit';

module('Unit | Mixin | reduce functions');

// Replace this with your real tests.
test('it works', function(assert) {
  let ReduceFunctionsObject = EmberObject.extend(ReduceFunctionsMixin);
  let subject = ReduceFunctionsObject.create();
  assert.ok(subject);
});
