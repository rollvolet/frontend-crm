import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | contacts table', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{contacts-table}}`);

    assert.dom('*').hasText('');

    // Template block usage:
    await render(hbs`
      {{#contacts-table}}
        template block text
      {{/contacts-table}}
    `);

    assert.dom('*').hasText('template block text');
  });
});
