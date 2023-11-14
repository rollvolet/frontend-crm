import config from '../config/constants';

export default function appConstant(path) {
  let [first, ...rest] = path.split('.');
  let obj = config;
  while (obj && first) {
    obj = obj[first];
    [first, ...rest] = rest;
  }
  return obj;
}
