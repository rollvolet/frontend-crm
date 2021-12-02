import deformatVatNumber from 'rollvolet-crm/utils/deformat-vat-number';
import { module, test } from 'qunit';

module('Unit | Utility | deformat-vat-number', function () {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let result = deformatVatNumber();
    assert.ok(result);
  });
});
