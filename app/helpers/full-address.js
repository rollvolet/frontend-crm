import { isPresent } from '@ember/utils';

export default function fullAddress(address) {
  return [address?.street, `${address?.postalCode || ''} ${address?.city || ''}`]
    .filter((line) => isPresent(line))
    .join(', ');
}
