import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { guidFor } from '@ember/object/internals';
import moment from 'moment';

export default class MainReportsOutstandingJobsIndexController extends Controller {
  @service router;

  page = 0;
  size = 100;
  sort = 'order-date';

  hasProductionTicket = -1;
  execution = 'na';
  isProductReady = -1;

  executionOptions = [
    { label: 'n.v.t.', value: 'na', id: `na-${guidFor(this)}` },
    { label: 'te leveren', value: 'delivery', id: `delivery-${guidFor(this)}` },
    { label: 'te plaatsen', value: 'installation', id: `installation-${guidFor(this)}` },
    { label: 'af te halen', value: 'pickup', id: `pickup-${guidFor(this)}` }
  ];

  @tracked sortDirectionOptions; // initialized in route
  @tracked sortFieldOptions; // initialized in route

  @tracked visitor;
  @tracked sortField;
  @tracked sortDirection;

  constructor() {
    super(...arguments);
    if (!this.orderDate) {
      const orderDate = new Date();
      orderDate.setYear(orderDate.getFullYear() - 1);
      this.set('orderDate', orderDate.toISOString().substr(0, 10));
    }
  }

  get orderDateObject() {
    return moment(this.orderDate, 'YYYY-MM-DD').toDate();
  }

  @action
  selectVisitor(employee) {
    this.visitor = employee;
    this.set('visitorName', employee && employee.firstName);
  }

  @action
  selectExecution(event) {
    this.set('execution', event.target.value);
  }

  @action
  setOrderDate(date) {
    const orderDate = date.toISOString().substr(0, 10); // yyyy-mm-dd
    this.set('orderDate', orderDate);
  }

  @action
  print() {
    this.router.transitionTo('main.reports.outstanding-jobs.print', {
      queryParams: {
        visitorName: this.visitorName,
        orderDate: this.orderDate,
        hasProductionTicket: this.hasProductionTicket,
        execution: this.execution,
        isProductReady: this.isProductReady
      }
    });
  }

  @action
  toggleComment(row) {
    row.expandComment = !row.expandComment;
  }

  @action
  previousPage() {
    this.selectPage(this.page - 1);
  }

  @action
  nextPage() {
    this.selectPage(this.page + 1);
  }

  @action
  selectPage(page) {
    this.set('page', page);
  }

  @action
  setSortField(option) {
    this.sortField = option;
    const sort = this.sortDirection.value == 'desc' ? `-${this.sortField.value}` : this.sortField.value;
    this.set('sort', sort);
  }

  @action
  setSortDirection(option) {
    this.sortDirection = option;
    const sort = this.sortDirection.value == 'desc' ? `-${this.sortField.value}` : this.sortField.value;
    this.set('sort', sort);
  }
}
