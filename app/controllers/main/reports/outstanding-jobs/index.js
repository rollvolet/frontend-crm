import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import subYears from 'date-fns/subYears';
import parseISO from 'date-fns/parseISO';
import formatISO from 'date-fns/formatISO';

export default class MainReportsOutstandingJobsIndexController extends Controller {
  @service router;

  @tracked page = 0;
  @tracked size = 100;
  @tracked sort = 'order-date';

  @tracked hasProductionTicket = -1;
  @tracked isProductReady = -1;
  @tracked deliveryMethod;
  @tracked deliveryMethodUri;
  @tracked visitor;
  @tracked visitorUri;
  @tracked orderDate;

  @tracked sortDirectionOptions; // initialized in route
  @tracked sortFieldOptions; // initialized in route

  @tracked sortField;
  @tracked sortDirection;

  get orderDateObject() {
    return parseISO(this.orderDate);
  }

  @action
  selectVisitor(employee) {
    this.visitor = employee;
    this.visitorUri = employee && employee.uri;
  }

  @action
  selectDeliveryMethod(deliveryMethod) {
    this.deliveryMethod = deliveryMethod;
    this.deliveryMethodUri = deliveryMethod && deliveryMethod.uri;
  }

  @action
  setOrderDate(date) {
    this.orderDate = formatISO(date, { representation: 'date' });
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
    this.page = page;
  }

  @action
  setSortField(option) {
    this.sortField = option;
    this.sort = this.getSortValue();
  }

  @action
  setSortDirection(option) {
    this.sortDirection = option;
    this.sort = this.getSortValue();
  }

  getSortValue() {
    if (this.sortDirection.value == 'desc') {
      return `-${this.sortField.value}`;
    } else {
      return this.sortField.value;
    }
  }
}
