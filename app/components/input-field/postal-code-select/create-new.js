import Component from '@ember/component';

export default Component.extend({
  actions: {
    create() {
      this.onCreate();
      this.select.actions.close();
    }
  }
});
