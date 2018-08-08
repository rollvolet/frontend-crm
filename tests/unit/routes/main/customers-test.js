import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | main/customers', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:main/customers');
    assert.ok(route);
  });
});
