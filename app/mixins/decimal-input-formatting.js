import Mixin from '@ember/object/mixin';
import formatDecimalInput from '../utils/format-decimal-input';
import deformatDecimalInput from '../utils/deformat-decimal-input';

export default Mixin.create({
  initDecimalInput(prop) {
    const formattedValue = formatDecimalInput(this.model.get(prop));
    this.set(`${prop}Input`, formattedValue);
  },

  actions: {
    formatDecimal(prop) {
      const deformattedValue = deformatDecimalInput(this.get(`${prop}Input`));
      this.model.set(prop, deformattedValue);
      const formattedValue = formatDecimalInput(this.model.get(prop));
      this.set(`${prop}Input`, formattedValue);
    }
  }
});
