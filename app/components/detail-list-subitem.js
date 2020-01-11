import classic from 'ember-classic-decorator';
import { classNames } from '@ember-decorators/component';
import Component from '@ember/component';

@classic
@classNames('detail-list--subitem')
export default class DetailListSubitem extends Component {}
