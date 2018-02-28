import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('invoice-calculation-table', 'Integration | Component | invoice calculation table', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{invoice-calculation-table}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#invoice-calculation-table}}
      template block text
    {{/invoice-calculation-table}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
