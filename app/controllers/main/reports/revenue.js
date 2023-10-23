import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
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
  @tracked fromYear = new Date().getFullYear() - 4;
  @tracked untilYear = new Date().getFullYear();

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
    return this.model.uniqBy('year').sortBy('year').mapBy('year');
  }

  get months() {
    return this.model.uniqBy('month').sortBy('month').mapBy('month');
  }
}
