import Model from '@ember-data/model';
import ArrayProxy from '@ember/array/proxy';
import { validate } from 'ember-validators';
import { typeOf } from '@ember/utils';
import { keepLatestTask, all } from 'ember-concurrency';
import { isHTMLSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';
import Messages from '../validators/messages';

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
  constructor(model, errors) {
    // create an errors object with an emtpy object for each attribute/relation
    const keys = [
      ...Array.from(model.attributes.keys()),
      ...Array.from(model.relationshipsByName.keys()),
    ];
    this.errors = Object.assign(
      {},
      ...keys.map((key) => {
        return { [key]: [] };
      })
    );

    if (errors && Object.keys(errors).length > 0) {
      for (const attribute in errors) {
        errors[attribute] = errors[attribute].map((error) => {
          if (typeof error == 'string') {
            return { message: error };
          } else {
            const message = this.createErrorMessage(error.type, error.value, error.options);
            return Object.assign({}, error, { message });
          }
        });
        this.errors[attribute] = ArrayProxy.create({
          content: errors[attribute],
          get messages() {
            return this.content.map((error) => error.message);
          },
        });
      }
    }
  }

  get isValid() {
    return Object.values(this.errors).every((attrErrors) => attrErrors.length == 0);
  }

  get isInvalid() {
    return !this.isValid;
  }

  get attrs() {
    return this.errors;
  }

  get messages() {
    const messages = Object.keys(this.attrs).map((attr) => {
      return this.attrs[attr].map((error) => `[${attr}] ${error.message}`);
    });
    return messages.flat();
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
  @tracked validations = new ValidationResult(this.constructor);

  validators = {};

  get isValidating() {
    return this.validateTask.isRunning;
  }

  // defined to be compliant with ember-cp-validations interface
  async validate() {
    this.validations = await this.validateTask.perform();
    return { validations: this.validations };
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

    return new ValidationResult(this.constructor, errors);
  }
}
