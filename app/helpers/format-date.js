import { helper } from '@ember/component/helper';
import { warn } from '@ember/debug';
import formatFn from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { nlBE } from 'date-fns/locale';

export function formatDate([date, format, customOptions = {}]) {
  const options = Object.assign({ locale: nlBE }, customOptions);
  if (date) {
    if (Array.isArray(date)) {
      warn('format-date helper exepected a single date, but got an array as value to format', {
        id: 'invalidate-date',
      });
      date = date[0];
    }

    if (typeof date == 'string') {
      return formatFn(parseISO(date), format, options);
    } else {
      return formatFn(date, format, options);
    }
  } else {
    return null;
  }
}

export default helper(formatDate);
