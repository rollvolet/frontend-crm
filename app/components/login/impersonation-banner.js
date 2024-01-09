import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class LoginImpersonationBannerComponent extends Component {
  @service userInfo;

  @action
  impersonate(employee) {
    this.userInfo.impersonate(employee);
  }

  @action
  resetImpersonation() {
    this.userInfo.resetImpersonation();
  }
}
