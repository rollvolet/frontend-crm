import Mixin from '@ember/object/mixin';
import { exec } from 'pell';

export default Mixin.create({
  pellOptions: Object.freeze({
    actions: [
      'bold', 'underline', 'italic', 'strikethrough', 'olist', 'ulist',
      {
        name: 'subscript',
        icon: 'x<sub>2</sub>',
        title: 'Subscript',
        result: () => exec('subscript')
      },
      {
        name: 'superscript',
        icon: 'x<sup>2</sup>',
        title: 'Superscript',
        result: () => exec('superscript')
      }
    ]
  })
});
