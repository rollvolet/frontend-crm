import formatVatNumber from 'rollvolet-crm/utils/format-vat-number';
import { module, test } from 'qunit';

module('Unit | Utility | format-vat-number', function () {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let result = formatVatNumber();
    assert.ok(result);
  });
});
