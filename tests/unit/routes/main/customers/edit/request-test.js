import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | main/customers/edit/request', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:main/customers/edit/request');
    assert.ok(route);
  });
});
