import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import EmberObject, { computed } from '@ember/object';
import { sort } from '@ember/object/computed';
import { task, hash } from 'ember-concurrency';

const _copyTelephone = function(telephone) {
  return EmberObject.create({
    id: telephone.get('id'),
    area: telephone.area,
    number: telephone.number,
    memo: telephone.memo,
    order: telephone.order,
    country: telephone.country,
    telephoneType: telephone.telephoneType
  });
};

@classic
export default class TelephoneEditForm extends Component {
  @service store

  @service configuration

  displayTelephones = null
  telephonesSort = Object.freeze(['order', 'id'])
  errorMessages = A()

  @computed('newTelephone', 'updatedNewTelephone')
  get isDisabledCreateNew() {
    if (this.newTelephone) {
      return this.newTelephone.validations.isInvalid
        || this.newTelephone.isError
        || this.updateNewTelephone.isRunning
        || this.updateNewTelephone.last.isError;
    }

    return false;
  }

  @sort('displayTelephones', 'telephonesSort') sortedTelephones

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);
    this.initCopiedTelephones.perform();
  }

  willDestroyElement() {
    if (!this.model.isDeleted)
      this.model.hasMany('telephones').reload();
    super.willDestroyElement(...arguments);
  }

  // creating a copy of the telephone ManyArray so the interface doesn't get rerendered
  // on each update (= delete and create) of a telephone
  @task(function * () {
    const telephones = yield this.model.telephones;
    const copiedTelephones = telephones.map(_copyTelephone);
    this.set('displayTelephones', A(copiedTelephones));
  })
  initCopiedTelephones;

  @task(function * (telephone) {
    const telephoneRecord = this.store.peekRecord('telephone', telephone.id);
    if (telephoneRecord)
      yield telephoneRecord.destroyRecord();
    this.displayTelephones.removeObject(telephone);
  })
  removeTelephone;

  @task(function * () {
    if (this.newTelephone) {
      yield this.newTelephone.destroyRecord();
      // TODO: Fix when Ember Data allows creation of already deleted ID
      // See https://github.com/emberjs/data/issues/4972
      //  and https://github.com/emberjs/data/issues/5006
      // this.store._removeFromIdMap(this.model._internalModel);
      this.set('newTelephone', null);
    }
  })
  removeNewTelephone;

  @task(function * () {
    if (this.newTelephone) {
      // check if it's saved an valid
      const copiedTelephone = _copyTelephone(this.newTelephone);
      this.displayTelephones.pushObject(copiedTelephone);
      this.set('newTelephone', null);
    }

    const customerEntity = yield this.model;
    const order = this.displayTelephones.length + 1;
    const telephoneType = this.configuration.defaultTelephoneType();
    const country = this.configuration.defaultCountry();

    const attributes = {
      order: order,
      telephoneType: telephoneType,
      country: country
    };
    attributes[customerEntity.constructor.modelName] = customerEntity;
    const telephone = this.store.createRecord('telephone', attributes);
    this.set('newTelephone', telephone);
    yield telephone.save();
  })
  createNewTelephone;

  @task(function * () {
    const { validations } = yield this.newTelephone.validate();

    if (!validations.isValid) {
      const error = new Error('Invalid telephone');
      error.isInternalError = true;
      throw error;
    }

    const resolvedPromises = yield hash({
      country: this.newTelephone.country,
      telephoneType: this.newTelephone.telephoneType,
      customer: this.newTelephone.customer,
      contact: this.newTelephone.contact,
      building: this.newTelephone.building
    });

    const updatedTelephone = this.store.createRecord('telephone', {
      area: this.newTelephone.area,
      number: this.newTelephone.number,
      memo: this.newTelephone.memo,
      order: this.newTelephone.order,
      country: resolvedPromises.country,
      telephoneType: resolvedPromises.telephoneType,
      customer: resolvedPromises.customer,
      contact: resolvedPromises.contact,
      building: resolvedPromises.building
    });

    try {
      // TODO fix error with ember data duplicate ID
      yield this.newTelephone.destroyRecord();
      yield updatedTelephone.save();
      this.errorMessages.clear();
      this.set('newTelephone', updatedTelephone);
    } catch(e) {
      if (!updatedTelephone.isValid)
        this.errorMessages.pushObject('Nummer bestaat al');

      updatedTelephone.deleteRecord();

      e.isInternalError = true;
      throw e; // save task must fail
    }
  }).keepLatest()
  updateNewTelephone; // cannot patch phone. Create new and remove old phone.
}
