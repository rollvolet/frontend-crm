import { helper } from '@ember/component/helper';

export function formatPhone([prefix, area, number]) {
  if (prefix && prefix.startsWith("00"))
    prefix = prefix.replace("00", "+"); // replaces only the 1st occurence

  if (number) {
    if (number.length == 6)
      number = `${number.substr(0,2)} ${number.substr(2,2)} ${number.substr(4,2)}`;
    else if (number.length > 6)
      number = `${number.substr(0,3)} ${number.substr(3,2)} ${number.substr(5,2)}`;
  }

  return `${prefix} ${area} ${number}`;
}

export default helper(formatPhone);
