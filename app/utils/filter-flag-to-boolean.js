export default function filterFlagToBoolean(flag, trueValue = true, falseValue = false) {
  if (flag >= 0) {
    return flag > 0 ? trueValue : falseValue;
  } else {
    return undefined;
  }
}
