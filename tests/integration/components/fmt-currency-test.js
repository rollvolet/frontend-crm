import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('fmt-currency', 'Integration | Component | fmt currency', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{fmt-currency}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#fmt-currency}}
      template block text
    {{/fmt-currency}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
