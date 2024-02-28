import { formatCurrency } from 'ember-dynamic-format-currency/helpers/format-currency';

export default function formatDecimalInput(value) {
  if (value) {
    const fmtValue = formatCurrency([value, 2, '', ' ', ',']).toString();
    return fmtValue.replace(/(&nbsp;)/g, ' ').trim(); // replace &nbsp;
  } else {
    return value;
  }
}
