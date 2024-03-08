import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class UserEditModalComponent extends Component {
  @service store;

  @cached
  get employeeType() {
    if (this.args.model.type) {
      return new TrackedAsyncData(this.store.findRecordByUri('concept', this.args.model.type));
    } else {
      return null;
    }
  }

  @cached
  get user() {
    return new TrackedAsyncData(this.args.model.user);
  }

  @cached
  get userGroups() {
    if (this.user.isResolved && this.user.value) {
      return new TrackedAsyncData(this.user.value.userGroups);
    } else {
      return [];
    }
  }

  @cached
  get account() {
    if (this.user.isResolved && this.user.value) {
      return new TrackedAsyncData(this.user.value.account);
    } else {
      return null;
    }
  }

  async rollback() {
    const user = await this.args.model.user;
    if (user) {
      await user.hasMany('userGroups').reload();
      await this.args.model.belongsTo('user').reload();
    }
    this.args.model.rollbackAttributes();
  }

  @action
  selectType(type) {
    this.args.model.type = type?.uri;
  }

  @action
  async selectAccount(account) {
    const user = await account?.user;
    this.args.model.user = user;
  }

  @action
  async setUserGroups(groups) {
    const user = await this.args.model.user;
    user.userGroups = groups;
  }

  @action
  async terminateEmployee() {
    await this.rollback();
    this.args.model.endDate = new Date();
    await this.args.model.save();
    this.args.didTerminate();
  }

  @action
  async activateEmployee() {
    await this.rollback();
    this.args.model.endDate = null;
    await this.args.model.save();
    this.args.didSave();
  }

  @action
  async cancel() {
    await this.rollback();
    this.args.onClose();
  }

  @action
  async save(event) {
    event.preventDefault();
    await this.args.model.save();
    const user = await this.args.model.user;
    if (user) {
      await user.save();
    }
    this.args.didSave();
  }
}
