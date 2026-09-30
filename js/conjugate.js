// Regular-conjugation oracle.
//
// The app no longer conjugates at runtime — js/data/verbs.js stores explicit forms
// so a pronunciation hint can hang off each one without drifting. This function is
// retained as the verifier's independent check (see verify.html): for every verb NOT
// flagged irregular, the stored forms must match what these rules produce.
//
// Handles the orthographic changes: -ar preterite 1sg c->qu / g->gu / ç->c,
// -er present 1sg c->ç / g->j, -ir present 1sg g->j.

/* Imperfect subjunctive, derived from the pretérito perfeito 3pl — a rule with NO
   exceptions in Portuguese (falaram -> falasse, fizeram -> fizesse, foram -> fosse),
   so unlike conjugateRegular this verifies irregular verbs too. The nós accent
   depends on vowel quality: closed ê for the regular -er theme vowel (comêssemos,
   devêssemos), open é for strong-preterite stems (fizéssemos, quiséssemos). */
function subjImperfectFromPerfeito3pl(form3pl, infinitive) {
  if (!/ram$/.test(form3pl)) return null;
  const stem = form3pl.slice(0, -3);
  const last = stem.slice(-1);
  let accented;
  if (last === 'e') {
    const regularEr = infinitive.slice(-2) === 'er' && stem === infinitive.slice(0, -2) + 'e';
    accented = stem.slice(0, -1) + (regularEr ? 'ê' : 'é');
  } else {
    const ACC = { a: 'á', i: 'í', o: 'ô' };
    accented = stem.slice(0, -1) + (ACC[last] || last);
  }
  return [stem + 'sse', stem + 'sse', accented + 'ssemos', stem + 'ssem'];
}

/* Present subjunctive, derived from the presente eu form — drop the -o, add
   -e/-e/-emos/-em (-ar) or -a/-a/-amos/-am (-er/-ir): falo → fale, tenho → tenha,
   faço → faça, peço → peça. An -ar stem keeps its sound (fico → fique, chego →
   chegue, começo → comece). Six verbs have no eu form ending in -o and get the
   forms they have had since Latin: ser seja, estar esteja, ir vá, dar dê, saber
   saiba, querer queira (haver haja is not drilled). Verifies irregular verbs too. */
const SUBJ_PRESENT_EXCEPTIONS = {
  ser:    ['seja', 'seja', 'sejamos', 'sejam'],
  estar:  ['esteja', 'esteja', 'estejamos', 'estejam'],
  ir:     ['vá', 'vá', 'vamos', 'vão'],
  dar:    ['dê', 'dê', 'demos', 'deem'],
  saber:  ['saiba', 'saiba', 'saibamos', 'saibam'],
  querer: ['queira', 'queira', 'queiramos', 'queiram'],
  haver:  ['haja', 'haja', 'hajamos', 'hajam'],
};
function subjPresentFromPresente1sg(form1sg, infinitive) {
  if (SUBJ_PRESENT_EXCEPTIONS[infinitive]) return SUBJ_PRESENT_EXCEPTIONS[infinitive].slice();
  return subjPresentRegular(form1sg, infinitive);
}
/* The bare rule, exceptions ignored — what a regular verb WOULD give, which is what
   the answer card compares against to highlight the irregular letters (seja vs sa). */
function subjPresentRegular(form1sg, infinitive) {
  if (!/o$/.test(form1sg)) return null;
  let stem = form1sg.slice(0, -1);
  if (infinitive.slice(-2) === 'ar') {
    const last = stem.slice(-1), base = stem.slice(0, -1);
    if (last === 'c') stem = base + 'qu';
    else if (last === 'g') stem = base + 'gu';
    else if (last === 'ç') stem = base + 'c';
    return [stem + 'e', stem + 'e', stem + 'emos', stem + 'em'];
  }
  return [stem + 'a', stem + 'a', stem + 'amos', stem + 'am'];
}

function conjugateRegular(verb) {
  const ending = verb.slice(-2);
  const stem = verb.slice(0, -2);
  const last = stem.slice(-1);
  const stemBase = stem.slice(0, -1);

  if (ending === 'ar') {
    let perfStem1 = stem;
    if (last === 'c') perfStem1 = stemBase + 'qu';
    else if (last === 'g') perfStem1 = stemBase + 'gu';
    else if (last === 'ç') perfStem1 = stemBase + 'c';
    return {
      presente: [stem + 'o', stem + 'a', stem + 'amos', stem + 'am'],
      perfeito: [perfStem1 + 'ei', stem + 'ou', stem + 'amos', stem + 'aram'],
      imperfeito: [stem + 'ava', stem + 'ava', stem + 'ávamos', stem + 'avam']
    };
  }

  if (ending === 'er') {
    let presStem1 = stem;
    if (last === 'c') presStem1 = stemBase + 'ç';
    else if (last === 'g') presStem1 = stemBase + 'j';
    return {
      presente: [presStem1 + 'o', stem + 'e', stem + 'emos', stem + 'em'],
      perfeito: [stem + 'i', stem + 'eu', stem + 'emos', stem + 'eram'],
      imperfeito: [stem + 'ia', stem + 'ia', stem + 'íamos', stem + 'iam']
    };
  }

  if (ending === 'ir') {
    let presStem1 = stem;
    if (last === 'g') presStem1 = stemBase + 'j';
    return {
      presente: [presStem1 + 'o', stem + 'e', stem + 'imos', stem + 'em'],
      perfeito: [stem + 'i', stem + 'iu', stem + 'imos', stem + 'iram'],
      imperfeito: [stem + 'ia', stem + 'ia', stem + 'íamos', stem + 'iam']
    };
  }

  return null;
}
