export default function filterFlagToBoolean(flag) {
  if (flag >= 0) {
    return flag > 0;
  } else {
    return undefined;
  }
}
