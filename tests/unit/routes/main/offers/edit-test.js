import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | main/offers/edit', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:main/offers/edit');
    assert.ok(route);
  });
});
