import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | buildings table', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{buildings-table}}`);

    assert.dom('*').hasText('');

    // Template block usage:
    await render(hbs`
      {{#buildings-table}}
        template block text
      {{/buildings-table}}
    `);

    assert.dom('*').hasText('template block text');
  });
});
