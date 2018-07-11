import { computed } from '@ember/object';
import Component from '@ember/component';
import { task, hash } from 'ember-concurrency';
import { inject as service } from '@ember/service';

const digitsOnly = /\D/g;

export default Component.extend({
  tagName: 'tr',

  store: service(),

  model: null,
  onRemove: null,
  onUpdate: null,

  formattedNumber: computed('model.number', function() {
    if (this.model.number) {
      const number = this.model.number.replace(digitsOnly, '');
      if (number.length > 6) {
        return `${number.substr(0,3)} ${number.substr(3,2)} ${number.substr(5)}`;
      } else if (number.length >= 5) {
        return `${number.substr(0,2)} ${number.substr(2,2)} ${number.substr(4)}`;
      } else if (number.length >= 3) {
        return `${number.substr(0,2)} ${number.substr(2,2)}`;
      } else {
        return number;
      }
    } else {
      return this.model.number;
    }
  }),

  remove: task(function * () {
    yield this.model.destroyRecord();
    // TODO: Fix this hack when Ember Data allows creation of already deleted ID
    // See https://github.com/emberjs/data/issues/4972
    //  and https://github.com/emberjs/data/issues/5006
    this.store._removeFromIdMap(this.model._internalModel);
    yield this.onRemove(this.model);
  }),
  save: task(function * () { // cannot patch phone. Create new and remove old phone.
    const { validations } = yield this.model.validate();

    if (!validations.isValid)
      throw new Error('Invalid telephone');

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
      telephoneType: resolvedPromises.telephoneType,
      customer: resolvedPromises.customer,
      contact: resolvedPromises.contact,
      building: resolvedPromises.building
    });

    try {
      yield newTelephone.save();
    } catch(e) {
      newTelephone.deleteRecord();
      throw e; // save task must fail
    }

    this.model.destroyRecord();
    // TODO: Fix this hack when Ember Data allows creation of already deleted ID
    // See https://github.com/emberjs/data/issues/4972
    //  and https://github.com/emberjs/data/issues/5006
    this.store._removeFromIdMap(this.model._internalModel);
    this.onUpdate(this.model, newTelephone);
  }).keepLatest(),

  actions: {
    setArea(area) {
      if (area)
        area = area.replace(digitsOnly, '');
      this.model.set('area', area);
    },
    setNumber(number) {
      if (number)
        number = number.replace(digitsOnly, '');
      this.model.set('number', number);
    }
  }
});
