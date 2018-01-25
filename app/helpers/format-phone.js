import { helper } from '@ember/component/helper';

export function formatPhone([value, ...rest]) {
  let phone = value.replace(/\./g, ' ');
  if (value.startsWith("00"))
    phone = phone.replace("00", "+"); // replaces only the 1st occurence
  return phone;
}

export default helper(formatPhone);
