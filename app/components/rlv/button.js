import Component from '@glimmer/component';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { computed } from '@ember/object';
import { assert } from '@ember/debug';
import { isPresent } from '@ember/utils';

export default class CoreButton extends Component {
  // Workaround for linkTo not accepting @model and @models parameter, regardless if one is null
  // https://github.com/emberjs/ember.js/issues/18265
  @computed('args.{model,models}')
  get models() {
    const hasModel = 'model' in this.args;
    const hasModels = 'models' in this.args;

    assert(
      'You cannot provide both the `@model` and `@models` arguments.',
      !hasModel || !hasModels
    );

    if (hasModel) {
      return [this.args.model];
    } else if (hasModels) {
      return this.args.models;
    }
    return [];
  }

  get queryParams() {
    return isPresent(this.args.query) ? this.args.query : {};
  }

  get buttonClass() {
    return ['button', this.sizeClass, this.skinClass].join(' ');
  }

  get skinClass() {
    if (this.args.skin == 'link') {
      return 'button--link';
    } else if (this.args.skin == 'secondary') {
      return 'button--secondary';
    } else if (this.args.skin == 'secondary-muted') {
      return 'button--secondary-muted';
    } else if (this.args.skin == 'secondary-link') {
      return 'button--secondary-link';
    } else if (this.args.skin == 'secondary-naked') {
      return 'button--secondary-naked';
    } else if (this.args.skin == 'tertiary') {
      return 'button--tertiary';
    } else if (this.args.skin == 'naked') {
      return this.args.alert ? 'button--alert-naked' : 'button--naked';
    } else {
      if (this.args.skin == 'muted') {
        return this.args.alert ? 'button--alert-muted' : 'button--primary-muted';
      } else {
        return this.args.alert ? 'button--alert' : 'button--primary';
      }
    }
  }

  get hasIconRight() {
    return this.args.icon && this.args.iconAlignment == 'right';
  }

  get hasIconLeft() {
    return this.args.icon && !this.hasIconRight;
  }

  get sizeClass() {
    if (this.args.size == 'small') {
      return 'button--small';
    } else if (this.args.size == 'large') {
      return 'button--large';
    } else if (this.args.size == 'xlarge') {
      return 'button--xlarge';
    } else {
      return 'button--normal';
    }
  }
}
