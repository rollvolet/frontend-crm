import { helper } from '@ember/component/helper';
import { isPresent } from '@ember/utils';

const groupPer2Chars = /(?=(?:..)*$)/;

export function formatPhone([prefix, value]) {
  if (prefix && prefix.startsWith('00')) {
    prefix = prefix.replace('00', '+'); // replaces only the 1st occurence
  }

  let formattedNumber;
  if (value) {
    const area = findArea(value);
    if (area) {
      let numberGroups = value.slice(area.length).split(groupPer2Chars);
      if (numberGroups.length > 1 && numberGroups[0].length == 1) {
        // concatenate first 2 elements if first element only contains 1 character
        numberGroups[1] = `${numberGroups[0]}${numberGroups[1]}`;
        numberGroups = numberGroups.slice(1);
      }

      let number = `${area} ${numberGroups.join(' ')}`;
      if (number.startsWith('0')) {
        formattedNumber = `(${number.slice(0, 1)})${number.slice(1)}`;
      } else {
        formattedNumber = number;
      }
    } else {
      formattedNumber = value;
    }
  }

  return [prefix, formattedNumber].filter((e) => isPresent(e)).join(' ');
}

export default helper(formatPhone);

function findArea(value) {
  let area = AREA_NUMBERS.find((area) => value.startsWith(area));
  if (area == '04' && value.length > 2) {
    // In area '04' only numbers like '2xx xx xx' and '3xx xx xx' occur.
    // That's how they can be distinguished from cell phone numbers
    if (!['2', '3'].includes(value.charAt(2))) {
      // we assume it's a cell phone number, hence area is 4 characters (eg. 0475)
      area = value.slice(0, 4);
    }
  }

  return area;
}

// all known area numbers in Belgium as found on
// https://nl.wikipedia.org/wiki/Lijst_van_Belgische_zonenummers
const AREA_NUMBERS = [
  '02',
  '03',
  '04',
  '09',
  '010',
  '011',
  '012',
  '013',
  '014',
  '015',
  '016',
  '019',
  '050',
  '051',
  '052',
  '053',
  '054',
  '055',
  '056',
  '057',
  '058',
  '059',
  '060',
  '061',
  '063',
  '064',
  '065',
  '067',
  '069',
  '071',
  '080',
  '081',
  '082',
  '083',
  '085',
  '086',
  '087',
  '089',
];
