// Inglês para brasileiros — verbos irregulares essenciais (inglês americano).
//
// Cada verbo vira até duas cartas: o passado simples e o particípio (quando o
// particípio existe como carta própria — 'be (you/we/they)' divide o "was/were"
// com a entrada de cima e não repete o "been").
//
// `pastPron`/`partPron` são pronúncias aproximadas escritas para ouvidos
// brasileiros ("aportuguesadas") — o h inglês vira "rr" como no carioca
// (had ≈ "rréd"). O `pt` é o gancho do prompt: precisa identificar UM verbo
// inglês sem ambiguidade, por isso os qualificadores em "fazer (ação, tarefa)"
// vs "fazer (criar, produzir)".
//
// Os exemplos são frases americanas do dia a dia com tradução em português
// carioca — o mesmo estilo falado do resto do Fala Gringo.

window.DATA_EN_IRREGULARES = {
  groups: ['passado', 'particípio'],

  verbs: [
    { base: 'be (I / he / she)', pt: 'ser, estar (eu / ele / ela)',
      past: 'was', pastPron: 'uóz',
      examplePast: 'I was tired yesterday.', examplePastPt: 'Eu estava cansado ontem.',
      part: 'been', partPron: 'bín',
      examplePart: 'I have been here before.', examplePartPt: 'Eu já estive aqui antes.' },

    { base: 'be (you / we / they)', pt: 'ser, estar (você / nós / eles)',
      past: 'were', pastPron: 'uêr',
      examplePast: 'They were at the beach.', examplePastPt: 'Eles estavam na praia.' },

    { base: 'go', pt: 'ir',
      past: 'went', pastPron: 'uênt',
      examplePast: 'We went out on Friday.', examplePastPt: 'A gente saiu na sexta.',
      part: 'gone', partPron: 'gón',
      examplePart: 'She has gone home.', examplePartPt: 'Ela já foi para casa.' },

    { base: 'do', pt: 'fazer (ação, tarefa)',
      past: 'did', pastPron: 'díd',
      examplePast: 'I did my homework.', examplePastPt: 'Fiz meu dever de casa.',
      part: 'done', partPron: 'dân',
      examplePart: 'Have you done it yet?', examplePartPt: 'Você já fez isso?' },

    { base: 'make', pt: 'fazer (criar, produzir)',
      past: 'made', pastPron: 'mêid',
      examplePast: 'She made a cake.', examplePastPt: 'Ela fez um bolo.',
      part: 'made', partPron: 'mêid',
      examplePart: 'I have made a decision.', examplePartPt: 'Tomei uma decisão.' },

    { base: 'have', pt: 'ter',
      past: 'had', pastPron: 'rréd',
      examplePast: 'We had a problem.', examplePastPt: 'A gente teve um problema.',
      part: 'had', partPron: 'rréd',
      examplePart: 'She has had that car for years.', examplePartPt: 'Ela tem aquele carro há anos.' },

    { base: 'get', pt: 'conseguir, ganhar',
      past: 'got', pastPron: 'gót',
      examplePast: 'I got a new job.', examplePastPt: 'Consegui um emprego novo.',
      part: 'gotten', partPron: 'gótên', partAlts: ['got'],
      examplePart: 'She has gotten better.', examplePartPt: 'Ela melhorou.' },

    { base: 'take', pt: 'pegar, levar',
      past: 'took', pastPron: 'túk',
      examplePast: 'She took the bus.', examplePastPt: 'Ela pegou o ônibus.',
      part: 'taken', partPron: 'têiken',
      examplePart: 'He has taken my keys.', examplePartPt: 'Ele pegou minhas chaves.' },

    { base: 'come', pt: 'vir',
      past: 'came', pastPron: 'kêim',
      examplePast: 'He came to my house.', examplePastPt: 'Ele veio na minha casa.',
      part: 'come', partPron: 'kâm',
      examplePart: 'She has come back.', examplePartPt: 'Ela voltou.' },

    { base: 'see', pt: 'ver',
      past: 'saw', pastPron: 'só',
      examplePast: 'I saw a movie last night.', examplePastPt: 'Vi um filme ontem à noite.',
      part: 'seen', partPron: 'síin',
      examplePart: 'Have you seen this?', examplePartPt: 'Você já viu isso?' },

    { base: 'know', pt: 'saber, conhecer',
      past: 'knew', pastPron: 'níu',
      examplePast: 'I knew the answer.', examplePastPt: 'Eu sabia a resposta.',
      part: 'known', partPron: 'nôun',
      examplePart: 'I have known her for years.', examplePartPt: 'Conheço ela há anos.' },

    { base: 'say', pt: 'dizer',
      past: 'said', pastPron: 'séd',
      examplePast: 'He said yes.', examplePastPt: 'Ele disse que sim.',
      part: 'said', partPron: 'séd',
      examplePart: 'She has said that before.', examplePartPt: 'Ela já disse isso antes.' },

    { base: 'eat', pt: 'comer',
      past: 'ate', pastPron: 'êit',
      examplePast: 'We ate feijoada on Saturday.', examplePastPt: 'Comemos feijoada no sábado.',
      part: 'eaten', partPron: 'íten',
      examplePart: 'Have you eaten yet?', examplePartPt: 'Você já comeu?' },

    { base: 'drink', pt: 'beber',
      past: 'drank', pastPron: 'drénk',
      examplePast: 'They drank coffee this morning.', examplePastPt: 'Eles tomaram café de manhã.',
      part: 'drunk', partPron: 'drânk',
      examplePart: 'She has drunk all the juice.', examplePartPt: 'Ela bebeu o suco todo.' },

    { base: 'buy', pt: 'comprar',
      past: 'bought', pastPron: 'bót',
      examplePast: 'I bought bread at the bakery.', examplePastPt: 'Comprei pão na padaria.',
      part: 'bought', partPron: 'bót',
      examplePart: 'We have bought a new sofa.', examplePartPt: 'Compramos um sofá novo.' },

    { base: 'think', pt: 'pensar, achar',
      past: 'thought', pastPron: 'thót (língua entre os dentes)',
      examplePast: 'I thought about you.', examplePastPt: 'Pensei em você.',
      part: 'thought', partPron: 'thót (língua entre os dentes)',
      examplePart: 'I have thought a lot about it.', examplePartPt: 'Já pensei muito nisso.' }
  ]
};
