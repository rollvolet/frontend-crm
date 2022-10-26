import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | main/customers/edit/intervention', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:main/customers/edit/intervention');
    assert.ok(route);
  });
});
