import Route from '@ember/routing/route';
import { service } from '@ember/service';
import formatISO from 'date-fns/formatISO';

export default class MainCalendarVisitsRoute extends Route {
  @service store;

  queryParams = {
    dateStr: { as: 'd', refreshModel: true },
  };

  async beforeModel(transition) {
    const date =
      transition.to.queryParams['d'] || formatISO(new Date(), { representation: 'date' });
    const [year, month, day] = date.split('-').map((d) => parseInt(d));

    this.calendarDay = await this.store.queryOne('calendar-day', {
      'filter[year]': year,
      'filter[month]': month,
      'filter[day]': day,
    });

    if (!this.calendarDay) {
      this.calendarDay = this.store.createRecord('calendar-day', {
        year,
        month,
        day,
      });

      await this.calendarDay.save();
    }
  }

  model() {
    return this.calendarDay;
  }
}
