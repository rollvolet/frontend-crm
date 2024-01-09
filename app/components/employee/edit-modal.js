import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { trackedFunction } from 'ember-resources/util/function';

export default class UserEditModalComponent extends Component {
  @service store;

  employeeTypeData = trackedFunction(this, async () => {
    if (this.args.model.type) {
      return await this.store.findRecordByUri('concept', this.args.model.type);
    } else {
      return null;
    }
  });

  userGroupsData = trackedFunction(this, async () => {
    const user = await this.args.model.user;
    if (user) {
      const userGroups = await user.userGroups;
      return userGroups;
    } else {
      return [];
    }
  });

  accountData = trackedFunction(this, async () => {
    const user = await this.args.model.user;
    return await user?.account;
  });

  get employeeType() {
    return this.employeeTypeData.value;
  }

  get userGroups() {
    return this.userGroupsData.value;
  }

  get account() {
    return this.accountData.value;
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
