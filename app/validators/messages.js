import Messages from 'ember-cp-validations/validators/messages';

// Default EN translations are available
// at https://github.com/offirgolan/ember-validators/blob/master/addon/messages.js

export default Messages.extend({
  defaultDescription: 'Dit veld',

  /**
   * Default validation error message strings
   */
  accepted: '{description} moet aangevinkt zijn',
  after: '{description} moet na {after} zijn',
  before: '{description} moet voor {before} zijn',
  blank: '{description} mag niet leeg zijn',
  collection: '{description} moet meerdere waarden bevatten',
  confirmation: '{description} is niet hetzelfde als {on}',
  date: '{description} moet een geldige datum bevatten',
  email: '{description} moet een geldig emailadres bevatten',
  empty: '{description} mag niet leeg zijn',
  equalTo: '{description} moet gelijk zijn aan {is}',
  even: '{description} moet even zijn',
  exclusion: '{description} is voorbehouden',
  greaterThan: '{description} moet groter zijn dan {gt}',
  greaterThanOrEqualTo: '{description} moet groter dan of gelijk zijn aan {gte}',
  inclusion: '{description} zit niet in de lijst',
  invalid: '{description} is ongeldig',
  lessThan: '{description} moet kleiner zijn dan {lt}',
  lessThanOrEqualTo: '{description} moet kleiner dan of gelijk zijn aan {lte}',
  notAnInteger: '{description} moet een geheel getal bevatten',
  notANumber: '{description} moet een nummer bevatten',
  odd: '{description} moet oneven zijn',
  onOrAfter: '{description} moet samen met of na {onOrAfter} zijn',
  onOrBefore: '{description} moet samen met of voor {onOrBefore} zijn',
  otherThan: '{description} moet iets anders bevatten dan {value}',
  phone: '{description} moet een geldig telefoonnummer bevatten',
  positive: '{description} moet positief zijn',
  multipleOf: '{description} moet een veelvoud zijn van {multipleOf}',
  present: '{description} is verplicht',
  singular: '{description} kan maar 1 waarde bevatten',
  tooLong: '{description} is te lang (maximum {max} karakters)',
  tooShort: '{description} is te kort (minimum {min} karakters)',
  between: '{description} moet tussen {min} en {max} karakters bevatten',
  url: '{description} moet een geldige URL zijn',
  wrongDateFormat: '{description} moet het formaat {format} volgen',
  wrongLength: '{description} moet exact {is} karakters bevatten'
});
