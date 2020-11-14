import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | main/reports/outstanding-jobs/index', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:main/reports/outstanding-jobs/index');
    assert.ok(route);
  });
});
