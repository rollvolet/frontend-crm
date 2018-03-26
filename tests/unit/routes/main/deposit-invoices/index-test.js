import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | main/deposit-invoices/index', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:main/deposit-invoices/index');
    assert.ok(route);
  });
});
