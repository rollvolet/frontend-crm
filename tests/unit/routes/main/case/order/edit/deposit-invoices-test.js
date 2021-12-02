import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | main/case/order/edit/deposit-invoices', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:main/case/order/edit/deposit-invoices');
    assert.ok(route);
  });
});
