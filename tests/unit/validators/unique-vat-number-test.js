import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Validator | unique-vat-number', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    const validator = this.owner.lookup('validator:unique-vat-number');
    assert.ok(validator);
  });
});
