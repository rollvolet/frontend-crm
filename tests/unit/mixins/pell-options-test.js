import EmberObject from '@ember/object';
import PellOptionsMixin from 'rollvolet-crm/mixins/pell-options';
import { module, test } from 'qunit';

module('Unit | Mixin | pell-options', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let PellOptionsObject = EmberObject.extend(PellOptionsMixin);
    let subject = PellOptionsObject.create();
    assert.ok(subject);
  });
});
