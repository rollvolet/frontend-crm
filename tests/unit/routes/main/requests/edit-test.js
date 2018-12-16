import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | main/requests/edit', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:main/requests/edit');
    assert.ok(route);
  });
});
