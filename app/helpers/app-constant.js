import { helper } from '@ember/component/helper';
import appConstant from '../utils/app-constant';

export default helper(([path]) => appConstant(path));
