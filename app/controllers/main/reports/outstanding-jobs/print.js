import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class MainReportsOutstandingJobsPrintController extends Controller {
  @service store;

  @tracked hasProductionTicket = -1;
  @tracked isProductReady = -1;
  @tracked deliveryMethodUri;
  @tracked visitorUri;
}
