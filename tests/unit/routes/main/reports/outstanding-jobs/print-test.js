import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | main/reports/outstanding-jobs/print', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:main/reports/outstanding-jobs/print');
    assert.ok(route);
  });
});
