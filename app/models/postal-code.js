import DS from 'ember-data';
import { computed } from '@ember/object';

const additionalLabelMap = {
  '1020': { 'nl': 'Laken', 'fr': 'Laeken' },
  '1030': { 'nl': 'Schaarbeek', 'fr': 'Schaerbeek' },
  '1050': { 'nl': 'Elsene', 'fr': 'Ixelles' },
  '1060': { 'nl': 'Sint-Gillis', 'fr': 'Saint-Gilles' },
  '1070': { 'nl': 'Anderlecht', 'fr': 'Anderlecht' },
  '1080': { 'nl': 'Sint-Jans-Molenbeek', 'fr': 'Molenbeek-Saint-Jean' },
  '1081': { 'nl': 'Koekelberg', 'fr': 'Koekelberg' },
  '1082': { 'nl': 'Sint-Agatha-Berchem', 'fr': 'Berchem-Sainte-Agathe' },
  '1083': { 'nl': 'Ganshoren', 'fr': 'Ganshoren' },
  '1090': { 'nl': 'Jette', 'fr': 'Jette' },
  '1120': { 'nl': 'Neder-Over-Heembeek', 'fr': 'Neder-Over-Heembeek' },
  '1130': { 'nl': 'Haren', 'fr': 'Haeren' },
  '1140': { 'nl': 'Evere', 'fr': 'Evere' },
  '1150': { 'nl': 'Sint-Pieters-Woluwe', 'fr': 'Woluwe-Saint-Pierre' },
  '1160': { 'nl': 'Oudergem', 'fr': 'Auderghem' },
  '1170': { 'nl': 'Watermaal-Bosvoorde', 'fr': 'Watermael-Boitsfort' },
  '1180': { 'nl': 'Ukkel', 'fr': 'Uccle' },
  '1190': { 'nl': 'Vorst', 'fr': 'Forest' },
  '1200': { 'nl': 'Sint-Lambrechts-Woluwe', 'fr': 'Woluwe-Saint-Lambert' },
  '1210': { 'nl': 'Sint-Joost-ten-Node', 'fr': 'Saint-Josse-ten-Noode' }
};

export default DS.Model.extend({
  code: DS.attr(),
  name: DS.attr(),
  search: computed('code', 'name', function() {
    let search = `${this.code} ${this.name}`;

    const additionalLabel = additionalLabelMap[this.code];
    if (additionalLabel) {
      if (this.name.toLowerCase() == 'bruxelles')
        search += ` (${additionalLabel.fr})`;
      else
        search += ` (${additionalLabel.nl})`;
    }

    return search;
  })
});
