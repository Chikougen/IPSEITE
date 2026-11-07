// Catalogue de démonstration : remplacer par la carte réelle avant mise en ligne.
// Le tarif et la durée ne sont volontairement pas inventés.
export const settings = { brand: 'Ipséité', whatsappNumber: '33768228951', bookingUrl: '' };
export function whatsappUrl(message) {
  return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
export const services = {
  semi: { title: 'Vernis semi-permanent', reason: 'Vous souhaitez une mise en couleur en conservant votre longueur naturelle.' },
  strengthen: { title: 'Renforcement sur ongles naturels', reason: 'Vous souhaitez surtout renforcer l’aspect de vos ongles, sans les rallonger.' },
  extensions: { title: 'Pose avec rallongement', reason: 'Votre priorité est d’obtenir une longueur supérieure à celle de vos ongles naturels.' },
  removal: { title: 'Dépose de la pose existante', reason: 'Vous souhaitez retirer votre pose actuelle, sans repartir sur une nouvelle pose.' },
  consult: { title: 'Conseil personnalisé avec l’institut', reason: 'Un échange permettra de préciser votre envie et de choisir une prestation adaptée.' },
};
export function recommend(a) {
  if (a.goal === 'remove') return a.existing === 'none'
    ? { id: 'consult', note: 'Vous indiquez ne pas avoir de pose à retirer : précisons ensemble votre besoin.' }
    : { id: 'removal', note: 'Le type de pose sera confirmé avant de choisir la technique de dépose.' };
  if (a.human || !a.goal || a.length === 'unsure' || a.existing === 'unsure')
    return { id: 'consult', note: 'Aucune prestation technique n’est arrêtée à ce stade.' };
  const id = a.length === 'extend' ? 'extensions' : a.goal === 'strengthen' ? 'strengthen' : a.goal === 'unsure' ? 'consult' : 'semi';
  return { id, note: a.existing === 'none'
    ? 'Le choix final sera confirmé lors du rendez-vous.'
    : 'Une pose est déjà présente : une dépose ou un remplissage pourra être nécessaire, à confirmer avec l’institut.' };
}
