import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('detail-icon-list-item', 'Integration | Component | detail icon list item', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{detail-icon-list-item}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#detail-icon-list-item}}
      template block text
    {{/detail-icon-list-item}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
