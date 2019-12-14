import Component from '@ember/component';

export default Component.extend({
  tagName: '',
  actions: {
    create() {
      this.onCreate();
      this.select.actions.close();
    }
  }
});
