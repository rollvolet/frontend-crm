import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import uniqBy from 'lodash/uniqBy';
import sum from '../../../utils/math/sum';

const MONTHS = [
  'januari',
  'februari',
  'maart',
  'april',
  'mei',
  'juni',
  'juli',
  'augustus',
  'september',
  'oktober',
  'november',
  'december',
];

export default class MainReportsRevenueController extends Controller {
  @tracked fromYear = this.currentYear - this.nbOfYears;
  @tracked untilYear = this.currentYear;
  nbOfYears = 4;

  get matrix() {
    const matrix = [];
    for (let i = 0; i < this.months.length; i++) {
      matrix[i] = { month: MONTHS[this.months[i] - 1], entries: [] };
      for (let j = 0; j < this.years.length; j++) {
        const entry = this.model.find((e) => e.month == this.months[i] && e.year == this.years[j]);
        matrix[i].entries[j] = entry;
      }
    }
    return matrix;
  }

  get totals() {
    return this.years.map((year) => {
      const amounts = this.model.filter((e) => e.year == year).map((e) => e && e.amount);
      return sum(amounts);
    });
  }

  get years() {
    return uniqBy(this.model, 'year')
      .map((e) => e.year)
      .sort((a, b) => a - b);
  }

  get months() {
    return uniqBy(this.model, 'month')
      .map((e) => e.month)
      .sort((a, b) => a - b);
  }

  get currentYear() {
    return new Date().getFullYear();
  }

  get hasNext() {
    return this.untilYear < this.currentYear;
  }

  get hasPrevious() {
    return true;
  }

  @action
  goToPrevious() {
    this.untilYear = this.untilYear - 1;
    this.fromYear = this.untilYear - this.nbOfYears;
  }

  @action
  goToNext() {
    this.untilYear = this.untilYear + 1;
    this.fromYear = this.untilYear - this.nbOfYears;
  }
}
