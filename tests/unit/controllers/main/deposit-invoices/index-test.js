import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | main/deposit-invoices/index', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:main/deposit-invoices/index');
    assert.ok(controller);
  });
});
