import { warn } from '@ember/debug';
import { helper } from '@ember/component/helper';

export function orderExecution([value]) {
  if (value == 'installation') {
    return 'Te plaatsen';
  } else if (value == 'delivery') {
    return 'Te leveren';
  } else if (value == 'pickup') {
    return 'Af te halen';
  } else {
    warn(`Unknown order execution '${value}'`, { id: 'rollvolet-crm.unknown-order-execution' });
    return 'Onbekend';
  }
}

export default helper(orderExecution);
