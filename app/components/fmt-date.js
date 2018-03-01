import Component from '@ember/component';

const FmtDateComponent = Component.extend({
  tagName: '',
  emptyValue: '-'
});

FmtDateComponent.reopenClass({
  positionalParams: ['value']
});

export default FmtDateComponent;
