import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | invoice calculation table', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{invoice-calculation-table}}`);

    assert.dom('*').hasText('');

    // Template block usage:
    await render(hbs`
      {{#invoice-calculation-table}}
        template block text
      {{/invoice-calculation-table}}
    `);

    assert.dom('*').hasText('template block text');
  });
});
