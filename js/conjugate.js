// Regular-conjugation oracle.
//
// The app no longer conjugates at runtime — js/data/verbs.js stores explicit forms
// so a pronunciation hint can hang off each one without drifting. This function is
// retained as the verifier's independent check (see verify.html): for every verb NOT
// flagged irregular, the stored forms must match what these rules produce.
//
// Handles the orthographic changes: -ar preterite 1sg c->qu / g->gu / ç->c,
// -er present 1sg c->ç / g->j, -ir present 1sg g->j.

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
