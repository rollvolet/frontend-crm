import Model from '@ember-data/model';
import ObjectProxy from '@ember/object/proxy';
import { validate } from 'ember-validators';
import { isNone, typeOf } from '@ember/utils';
import { keepLatestTask, all } from 'ember-concurrency';
import Messages from '../validators/messages';
import { isHTMLSafe } from '@ember/template';

export class Validator {
  constructor(type, options) {
    this.type = type;
    this.options = options;
  }

  validate(value, model, attribute) {
    if (this.type == 'inline') {
      return this.options.validate(value, this.options, model, attribute);
    } else {
      return validate(this.type, value, this.options, model, attribute);
    }
  }
}

export class ValidationResult {
  constructor(errors) {
    if (errors && Object.keys(errors).length > 0) {
      this.errors = {};
      for (const attribute in errors) {
        errors[attribute].forEach((error) => {
          error.message = this.createErrorMessage(error.type, error.value, error.options);
        });
        this.errors[attribute] = ObjectProxy.create({
          content: errors[attribute],
          get messages() {
            return this.content.map((error) => error.message);
          },
        });
      }
    } else {
      this.errors = null;
    }
  }

  get isValid() {
    return isNone(this.errors);
  }

  get isInvalid() {
    return !this.isValid;
  }

  get attrs() {
    return ObjectProxy.create({
      content: this.errors || {},
      get: function (target, key) {
        return target[key] || {};
      },
    });
  }

  createErrorMessage(type, value, options = {}) {
    if (!options.description) {
      options.description = Messages.defaultDescription;
    }

    let message;
    if (options.message) {
      message = isHTMLSafe(options.message) ? options.message.toString() : options.message;
      Messages.formatMessage(message, options);
    } else {
      message = Messages.getMessageFor(type, options);
    }

    return message.trim();
  }
}

export default class ValidatedModel extends Model {
  validators = {};

  get validations() {
    if (this.validateTask.lastSuccessful) {
      return this.validateTask.lastSuccessful.value.validations;
    } else {
      // validations haven't been executed yet. Return an empty ValidationResult.
      return new ValidationResult();
    }
  }

  get isValidating() {
    return this.validateTask.isRunning;
  }

  // defined to be compliant with ember-cp-validations interface
  validate() {
    return this.validateTask.perform();
  }

  @keepLatestTask
  *validateTask() {
    const errors = {};
    for (const attribute in this.validators) {
      let validators = this.validators[attribute];
      if (typeOf(validators) != 'array') {
        validators = [validators];
      }
      const validations = yield all(
        validators.map((validator) => {
          const value = this[attribute];
          return validator.validate(value, this, attribute);
        })
      );
      const invalidValidations = validations.filter((v) => v != true);
      if (invalidValidations.length) {
        errors[attribute] = invalidValidations;
      }
    }

    return { validations: new ValidationResult(errors) };
  }
}
