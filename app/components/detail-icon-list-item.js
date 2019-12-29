import classic from 'ember-classic-decorator';
import { classNames } from '@ember-decorators/component';
import Component from '@ember/component';

@classic
@classNames('resource-details--section', 'layout-row')
export default class DetailIconListItem extends Component {}
