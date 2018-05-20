import Component from '@ember/component';
import { task, hash } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default Component.extend({
  tagName: 'tr',

  store: service(),

  model: null,

  save: task(function * () { // cannot patch phone. Create new and remove old phone.
    // TODO add initial validation
    const resolvedPromises = yield hash({
      country: this.model.country,
      telephoneType: this.model.telephoneType,
      customer: this.model.customer,
      contact: this.model.contact,
      building: this.model.building
    });
    const newTelephone = this.store.createRecord('telephone', {
      area: this.model.area,
      number: this.model.number,
      memo: this.model.memo,
      order: this.model.order,
      country: resolvedPromises.country,
      telephoneType: resolvedPromises.telephoneType
    });
    yield this.model.destroyRecord();
    // TODO: Fix this hack when Ember Data allows creation of already deleted ID
    // See https://github.com/emberjs/data/issues/4972
    //  and https://github.com/emberjs/data/issues/5006
    this.store._removeFromIdMap(this.model._internalModel);
    newTelephone.setProperties({
      customer: resolvedPromises.customer,
      contact: resolvedPromises.contact,
      building: resolvedPromises.building
    });
    yield newTelephone.save();
  }).keepLatest()
});
