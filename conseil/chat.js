import { settings, services, recommend, whatsappUrl } from './catalogue.js';

if (new URLSearchParams(window.location.search).get('embed') === '1') document.body.classList.add('embedded');

const $ = id => document.getElementById(id);
const questions = {
  goal: { label: 'Votre envie', text: 'Bonjour et bienvenue chez Ipséité. Qu’aimeriez-vous pour vos ongles ?', options: [['color','Une jolie couleur'],['strengthen','Renforcer mes ongles naturels'],['longer','Des ongles plus longs'],['remove','Retirer ma pose'],['unsure','Je ne sais pas encore']] },
  length: { label: 'La longueur', text: 'Vous préférez garder votre longueur naturelle ou rallonger vos ongles ?', options: [['natural','Garder ma longueur naturelle'],['extend','Rallonger mes ongles'],['unsure','J’ai besoin d’un conseil']] },
  existing: { label: 'Votre pose actuelle', text: 'Avez-vous déjà une pose sur vos ongles ?', options: [['none','Non, aucune pose'],['semi','Oui, du semi-permanent'],['gel','Oui, du gel ou des extensions'],['unsure','Je ne connais pas la technique']] },
  style: { label: 'Votre style', text: 'Quel résultat vous ferait plaisir ?', options: [['discreet','Naturel et discret'],['colorful','Une belle couleur'],['art','French ou nail art'],['unsure','À choisir ensemble']] },
};
let answers = {}, current = 'goal', history = [], messages = [], result;

function addMessage(text, who = 'bot') {
  messages.push({text, who});
  const bubble = document.createElement('p');
  bubble.className = 'bubble ' + who;
  bubble.textContent = text;
  $('conversation').append(bubble);
  scrollDown();
}
function scrollDown() { $('conversation').scrollTop = $('conversation').scrollHeight; }
function button(label, action, className = 'choice') {
  const node = document.createElement('button');
  node.type = 'button'; node.className = className; node.textContent = label;
  node.addEventListener('click', action); $('actions').append(node); return node;
}
function totalSteps() { return answers.goal === 'remove' ? 2 : answers.goal === 'longer' ? 3 : 4; }
function renderActions() {
  $('actions').replaceChildren();
  const q = questions[current];
  const step = history.length + 1;
  $('step-label').textContent = q.label;
  $('step-count').textContent = `${step} / ${totalSteps()}`;
  $('progress').style.width = `${Math.min(step / totalSteps(), 1) * 100}%`;
  $('message-form').hidden = false;
  q.options.forEach(([value,label]) => button(label, () => choose(value,label)));
  if (history.length) button('← Question précédente', back, 'secondary');
  button('Je préfère échanger avec l’institut', human, 'secondary');
}
function choose(value, label) {
  history.push({ answers: {...answers}, current, messages: [...messages] });
  addMessage(label,'user');
  answers[current] = value;
  answers[current + 'Label'] = label;
  if (current === 'goal') {
    if (value === 'remove') current = 'existing';
    else if (value === 'longer') { answers.length = 'extend'; answers.lengthLabel = 'Rallonger mes ongles'; current = 'existing'; }
    else current = 'length';
  } else if (current === 'length') current = 'existing';
  else if (current === 'existing' && answers.goal !== 'remove') current = 'style';
  else { showResult(); return; }
  addMessage(questions[current].text);
  renderActions();
}
function human() {
  history.push({answers: {...answers}, current, messages: [...messages]});
  answers.human = true; addMessage('Je préfère échanger avec l’institut.','user'); showResult();
}
function back() {
  const previous = history.pop(); if (!previous) return;
  answers = previous.answers; current = previous.current; messages = previous.messages;
  result = undefined;
  $('conversation').replaceChildren();
  const prior = [...messages]; messages = [];
  prior.forEach(m => addMessage(m.text,m.who));
  renderActions();
}
function summaryText() {
  const details = [['Envie',answers.goalLabel],['Longueur',answers.lengthLabel],['Pose actuelle',answers.existingLabel],['Style',answers.styleLabel]].filter(([,v]) => v);
  return `Bonjour Ipséité,\n\nJe souhaite un échange pour organiser un rendez-vous.\n${details.map(([key,value]) => `${key} : ${value}`).join('\n')}\n${answers.notes?.length ? '\nPrécisions : ' + answers.notes.join(' / ') + '\n' : ''}\nOrientation proposée : ${services[result.id].title}.\n${result.note}\n\nPouvez-vous confirmer la prestation, le tarif, la durée et vos disponibilités ?\n\nMerci !`;
}
function showResult() {
  const alreadyVisible = current === 'result';
  current = 'result'; result = recommend(answers);
  $('message-form').hidden = true;
  $('actions').replaceChildren();
  $('step-label').textContent = 'Votre conseil personnalisé';
  $('step-count').textContent = 'Terminé'; $('progress').style.width = '100%';
  if (!alreadyVisible) addMessage('Merci ! Voici la piste que je vous propose, à confirmer avec l’institut.');
  $('conversation').querySelector('.recommendation')?.remove();
  const card = document.createElement('article'); card.className = 'recommendation';
  for (const [tag,text,cls] of [['p','VOTRE ORIENTATION','eyebrow'],['h3',services[result.id].title,''],['p',services[result.id].reason,''],['p',result.note,'detail'],['p',answers.style === 'art' ? 'French ou nail art : détail et supplément éventuel à confirmer.' : 'Tarif et durée à confirmer avec l’institut.','detail']]) {
    const el = document.createElement(tag); el.textContent = text; el.className = cls; card.append(el);
  }
  $('conversation').append(card); scrollDown();
  button('Demander un rendez-vous sur WhatsApp', prepareRequest, 'primary');
  button('← Modifier mes réponses', back, 'secondary');
  button('Recommencer', reset, 'secondary');
}
function prepareRequest() {
  $('actions').replaceChildren();
  const notice = document.createElement('p'); notice.className = 'notice';
  notice.textContent = 'Relisez votre demande, puis ouvrez WhatsApp pour l’envoyer à Ipséité au 07 68 22 89 51. Le rendez-vous sera confirmé lors de votre échange.';
  $('actions').append(notice);
  const text = document.createElement('div'); text.className = 'summary'; text.textContent = summaryText(); $('actions').append(text);
  const whatsapp = document.createElement('a');
  whatsapp.href = whatsappUrl(summaryText());
  whatsapp.target = '_blank'; whatsapp.rel = 'noopener noreferrer';
  whatsapp.className = 'primary whatsapp-link';
  whatsapp.textContent = 'Continuer sur WhatsApp';
  $('actions').append(whatsapp);
  const feedback = document.createElement('p'); feedback.className = 'notice'; feedback.setAttribute('role','status');
  button('Copier ma demande', async () => {
    try { await navigator.clipboard.writeText(summaryText()); feedback.textContent = 'Message copié. Vous pouvez le coller dans votre messagerie.'; }
    catch { feedback.textContent = 'La copie automatique n’est pas disponible. Sélectionnez le texte ci-dessus ou téléchargez-le.'; }
  }, 'secondary');
  button('Télécharger le message', () => {
    const blob = new Blob([summaryText()], {type:'text/plain;charset=utf-8'}), url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'Ma_demande_Ipseite.txt'; link.click();
    setTimeout(() => URL.revokeObjectURL(url),1000);
    feedback.textContent = 'Message préparé pour téléchargement. Aucune demande envoyée.';
  }, 'secondary');
  if (settings.bookingUrl) {
    try {
      const url = new URL(settings.bookingUrl);
      if (url.protocol === 'https:') button('Ouvrir la prise de rendez-vous', () => window.open(url.href,'_blank','noopener,noreferrer'), 'primary');
    } catch { /* Pas de lien de réservation valide configuré. */ }
  }
  button('← Revenir à mon conseil', showResult, 'secondary');
  $('actions').append(feedback);
}
function reset() {
  answers = {}; current = 'goal'; history = []; messages = []; result = undefined;
  $('conversation').replaceChildren(); $('message').value = '';
  addMessage(questions.goal.text); renderActions();
}
function normalize(text) { return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
$('message-form').addEventListener('submit', event => {
  event.preventDefault(); const text = $('message').value.trim(); if (!text || current === 'result') return;
  $('message').value = ''; addMessage(text,'user');
  (answers.notes ??= []).push(text);
  const normalized = normalize(text);
  if (/douleur|saigne|infection|mycose|allergie|blesse|ongle vert/.test(normalized)) {
    answers.human = true;
    addMessage('Je transmets ce point dans votre récapitulatif. Le parcours commercial ne permet pas de déterminer une prestation sur cette base : un échange préalable est nécessaire.');
    showResult(); return;
  }
  // Ne pas deviner une technique à partir de mots isolés ou d’une négation.
  addMessage('Merci pour cette précision, je l’ajoute à votre demande. Choisissez la réponse la plus proche ci-dessous, ou demandez un échange avec l’institut.');
  renderActions();
});
$('restart').addEventListener('click',reset);
reset();
