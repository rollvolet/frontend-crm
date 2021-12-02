import { helper } from '@ember/component/helper';

export function formatPhoneNumber([number]) {
  if (number) {
    if (number.length == 6)
      number = `${number.substr(0, 2)} ${number.substr(2, 2)} ${number.substr(4)}`;
    else if (number.length > 6)
      number = `${number.substr(0, 3)} ${number.substr(3, 2)} ${number.substr(5)}`;
  }

  return `${number}`;
}

export default helper(formatPhoneNumber);
