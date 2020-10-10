import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | main/interventions/edit/customer', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:main/interventions/edit/customer');
    assert.ok(route);
  });
});
