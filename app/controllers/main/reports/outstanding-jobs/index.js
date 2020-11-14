import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class MainReportsOutstandingJobsIndexController extends Controller {
  @service router;

  page = 0;
  size = 100;
  hasProductionTicket = -1;
  mustBeInstalled = -1;
  mustBeDelivered = -1;
  isProductReady = -1

  @tracked visitor;

  constructor() {
    super(...arguments);
    if (!this.orderDate) {
      const orderDate = new Date();
      orderDate.setYear(orderDate.getFullYear() - 1);
      this.set('orderDate', orderDate.toISOString().substr(0, 10));
    }
  }

  @action
  goToOrder(row) {
    this.transitionToRoute('main.case.order.edit', row.customerNumber, row.orderId);
  }

  @action
  selectVisitor(employee) {
    this.visitor = employee;
    this.set('visitorName', employee && employee.firstName);
  }

  @action
  print() {
    this.router.transitionTo('main.reports.outstanding-jobs.print', {
      queryParams: {
        visitorName: this.visitorName,
        orderDate: this.orderDate,
        hasProductionTicket: this.hasProductionTicket,
        mustBeInstalled: this.mustBeInstalled,
        mustBeDelivered: this.mustBeDelivered,
        isProductReady: this.isProductReady
      }
    });
  }
}
