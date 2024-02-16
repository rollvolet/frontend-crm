export default {
  NED: {
    offerDocumentIntro:
      '<p class="aanhef">Beste klant,</p><br><div>Met genoegen bezorgen wij u onze beste prijs voor:</div>',
    offerDocumentOutro(requiresDeposit) {
      return (
        '<p>Deze offerte is 30 dagen geldig.</p><br><div>Indien u akkoord gaat met deze offerte vragen wij u vriendelijk ons dit schriftelijk te bevestigen, via email of per post.' +
        (requiresDeposit
          ? ' Wij bezorgen u daarna een voorschotfactuur van 30% van het totale bedrag.'
          : '') +
        '</div><br><div>Door goedkeuring van deze offerte verklaart u zich akkoord met de bijgevoegde algemene voorwaarden.</div>'
      );
    },
  },
  FRA: {
    offerDocumentIntro: `<p class="aanhef">Madame, Monsieur,</p><br><div>Suite à votre demande, nous avons l'avantage de vous faire notre meilleure offre pour:</div>`,
    offerDocumentOutro(requiresDeposit) {
      return (
        "<p>Cette offre est valable pendant 30 jours.</p><br><div>Si vous êtes d'accord, veuillez nous envoyer votre confirmation par écrit." +
        (requiresDeposit
          ? " Vous recevrez ensuite une facture d'acompte de 30% du montant total."
          : '') +
        " En acceptant cette offre, vous confirmez votre accord avec nos conditions g&eacute;n&eacute;rales de vente ci-jointes.</div><br><div>Dans l'attente du plaisir de lire votre accord, nous vous prions d'agréer nos salutations distinguées.</div>"
      );
    },
  },
};
