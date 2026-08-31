// Inglês para brasileiros — phrasal verbs do dia a dia (inglês americano).
//
// A maior lacuna de quem aprende inglês: o verbo + partícula que não se traduz
// palavra por palavra. Uma carta por phrasal verb; o `pt` é o gancho do prompt
// e precisa identificar UM phrasal sem ambiguidade — daí os qualificadores
// ("voltar (para cá)" = come back vs "voltar (para lá)" = go back,
//  "desligar (aparelho, a luz)" = turn off vs "desligar (o telefone)" = hang up).
//
// `pron` é a pronúncia aportuguesada, como nos irregulares. O `example` precisa
// conter o phrasal verb EXATO e contíguo (o check verifica) — por isso as
// frases usam imperativo, modal ou sujeito I/you/we/they, nunca 3ª pessoa
// do singular nem passado. Separabilidade e outros sentidos vão no `tip`.

window.DATA_EN_PHRASAL = {
  groups: ['rotina', 'movimento', 'pessoas', 'estudo e trabalho'],

  cards: [
    /* -------------------------------------------------------- rotina ---- */

    { pv: 'wake up', pt: 'acordar', group: 'rotina', pron: 'uêik âp',
      example: 'I wake up at seven every day.', examplePt: 'Acordo às sete todo dia.',
      tip: 'Separável: "wake me up at eight" = me acorda às oito.' },

    { pv: 'get up', pt: 'levantar (da cama)', group: 'rotina', pron: 'guét âp',
      example: 'I get up as soon as the alarm rings.', examplePt: 'Levanto assim que o despertador toca.' },

    { pv: 'turn on', pt: 'ligar (aparelho, a luz)', group: 'rotina', pron: 'târn ón',
      example: 'Can you turn on the light?', examplePt: 'Pode acender a luz?',
      tip: 'Separável: "turn it on" = liga ele.' },

    { pv: 'turn off', pt: 'desligar (aparelho, a luz)', group: 'rotina', pron: 'târn óf',
      example: 'Please turn off the TV.', examplePt: 'Por favor, desliga a TV.' },

    { pv: 'turn up', pt: 'aumentar (o volume)', group: 'rotina', pron: 'târn âp',
      example: 'Turn up the music!', examplePt: 'Aumenta o som!' },

    { pv: 'turn down', pt: 'abaixar (o volume)', group: 'rotina', pron: 'târn dáun',
      example: 'Can you turn down the volume?', examplePt: 'Pode abaixar o volume?',
      tip: 'Com um convite, "turn down" também é recusar.' },

    { pv: 'put on', pt: 'colocar (roupa), vestir', group: 'rotina', pron: 'pút ón',
      example: 'Put on a jacket, it is cold.', examplePt: 'Coloca um casaco, tá frio.' },

    { pv: 'take off', pt: 'tirar (a roupa); decolar', group: 'rotina', pron: 'têik óf',
      example: 'Take off your shoes at the door.', examplePt: 'Tira o sapato na porta.',
      tip: 'Também o avião: "the plane takes off" = o avião decola.' },

    { pv: 'try on', pt: 'experimentar (roupa)', group: 'rotina', pron: 'trái ón',
      example: 'Can I try on these jeans?', examplePt: 'Posso experimentar essa calça?' },

    { pv: 'throw away', pt: 'jogar fora', group: 'rotina', pron: 'thrôu auêi',
      example: 'Do not throw away the box.', examplePt: 'Não joga a caixa fora.' },

    { pv: 'clean up', pt: 'limpar, arrumar (a bagunça)', group: 'rotina', pron: 'clín âp',
      example: 'Help me clean up the kitchen.', examplePt: 'Me ajuda a arrumar a cozinha.' },

    { pv: 'work out', pt: 'malhar, fazer exercício', group: 'rotina', pron: 'uârk áut',
      example: 'I work out three times a week.', examplePt: 'Malho três vezes por semana.',
      tip: 'Também: dar certo — "it will work out" = vai dar certo.' },

    { pv: 'eat out', pt: 'comer fora', group: 'rotina', pron: 'ít áut',
      example: 'We eat out every Friday.', examplePt: 'Comemos fora toda sexta.' },

    /* ---------------------------------------------------- movimento ---- */

    { pv: 'go out', pt: 'sair (para se divertir)', group: 'movimento', pron: 'gôu áut',
      example: 'We should go out tonight!', examplePt: 'A gente devia sair hoje à noite!' },

    { pv: 'come back', pt: 'voltar (para cá)', group: 'movimento', pron: 'kâm bék',
      example: 'Come back soon!', examplePt: 'Volta logo!' },

    { pv: 'go back', pt: 'voltar (para lá)', group: 'movimento', pron: 'gôu bék',
      example: 'I want to go back to Rio.', examplePt: 'Quero voltar pro Rio.' },

    { pv: 'pick up', pt: 'buscar, ir pegar (alguém)', group: 'movimento', pron: 'pík âp',
      example: 'I can pick up the kids at five.', examplePt: 'Posso buscar as crianças às cinco.',
      tip: 'Separável: "pick you up" = te buscar. Também: atender o telefone.' },

    { pv: 'drop off', pt: 'deixar (alguém, algo num lugar)', group: 'movimento', pron: 'dróp óf',
      example: 'I can drop off the documents tomorrow.', examplePt: 'Posso deixar os documentos amanhã.' },

    { pv: 'get in', pt: 'entrar (no carro)', group: 'movimento', pron: 'guét ín',
      example: 'Get in the car!', examplePt: 'Entra no carro!' },

    { pv: 'get out', pt: 'sair (do carro)', group: 'movimento', pron: 'guét áut',
      example: 'Get out of the car, please.', examplePt: 'Sai do carro, por favor.' },

    { pv: 'get on', pt: 'subir (no ônibus, trem)', group: 'movimento', pron: 'guét ón',
      example: 'I get on the bus near my house.', examplePt: 'Subo no ônibus perto de casa.' },

    { pv: 'get off', pt: 'descer (do ônibus, trem)', group: 'movimento', pron: 'guét óf',
      example: 'Get off at the last station.', examplePt: 'Desce na última estação.' },

    { pv: 'show up', pt: 'aparecer, chegar (num lugar)', group: 'movimento', pron: 'xôu âp',
      example: 'They always show up late.', examplePt: 'Eles sempre chegam atrasados.' },

    { pv: 'slow down', pt: 'desacelerar, ir mais devagar', group: 'movimento', pron: 'slôu dáun',
      example: 'Slow down, the road is wet!', examplePt: 'Vai devagar, a pista tá molhada!' },

    /* ------------------------------------------------------ pessoas ---- */

    { pv: 'hang out', pt: 'ficar de boa, sair (com amigos)', group: 'pessoas', pron: 'rêng áut',
      example: 'We hang out at the beach on weekends.', examplePt: 'A gente fica de boa na praia no fim de semana.' },

    { pv: 'get along', pt: 'se dar bem (com alguém)', group: 'pessoas', pron: 'guét alóng',
      example: 'I get along with my in-laws.', examplePt: 'Me dou bem com meus sogros.' },

    { pv: 'get over', pt: 'superar (algo ruim)', group: 'pessoas', pron: 'guét ôuver',
      example: 'You need to get over it.', examplePt: 'Você precisa superar isso.' },

    { pv: 'break up', pt: 'terminar (o namoro)', group: 'pessoas', pron: 'brêik âp',
      example: 'They break up every month.', examplePt: 'Eles terminam todo mês.' },

    { pv: 'make up', pt: 'fazer as pazes; inventar (uma história)', group: 'pessoas', pron: 'mêik âp',
      example: 'They always make up after a fight.', examplePt: 'Eles sempre fazem as pazes depois da briga.' },

    { pv: 'ask out', pt: 'chamar para sair', group: 'pessoas', pron: 'ésk áut',
      example: 'I want to ask out my neighbor.', examplePt: 'Quero chamar minha vizinha pra sair.',
      tip: 'Quase sempre separado: "ask her out" = chamar ela pra sair.' },

    { pv: 'look after', pt: 'cuidar de', group: 'pessoas', pron: 'lúk éfter',
      example: 'Can you look after my dog this weekend?', examplePt: 'Pode cuidar do meu cachorro no fim de semana?' },

    { pv: 'grow up', pt: 'crescer (virar adulto)', group: 'pessoas', pron: 'grôu âp',
      example: 'Kids grow up so fast.', examplePt: 'As crianças crescem tão rápido.' },

    { pv: 'move on', pt: 'seguir em frente', group: 'pessoas', pron: 'múv ón',
      example: 'It is time to move on.', examplePt: 'É hora de seguir em frente.' },

    { pv: 'call back', pt: 'ligar de volta, retornar (a ligação)', group: 'pessoas', pron: 'cól bék',
      example: 'Can you call back later?', examplePt: 'Pode ligar de volta mais tarde?' },

    { pv: 'hang up', pt: 'desligar (o telefone)', group: 'pessoas', pron: 'rêng âp',
      example: 'Do not hang up, wait!', examplePt: 'Não desliga, espera!' },

    { pv: 'speak up', pt: 'falar mais alto', group: 'pessoas', pron: 'spík âp',
      example: 'Speak up, please!', examplePt: 'Fala mais alto, por favor!' },

    /* ------------------------------------------- estudo e trabalho ---- */

    { pv: 'find out', pt: 'descobrir (uma informação)', group: 'estudo e trabalho', pron: 'fáind áut',
      example: 'I need to find out the price.', examplePt: 'Preciso descobrir o preço.' },

    { pv: 'figure out', pt: 'sacar, entender (como resolver)', group: 'estudo e trabalho', pron: 'fíguer áut',
      example: 'Help me figure out this problem.', examplePt: 'Me ajuda a resolver esse problema.' },

    { pv: 'look for', pt: 'procurar', group: 'estudo e trabalho', pron: 'lúk fór',
      example: 'I need to look for an apartment.', examplePt: 'Preciso procurar um apartamento.' },

    { pv: 'look forward to', pt: 'estar ansioso por, aguardar ansiosamente', group: 'estudo e trabalho', pron: 'lúk fóruerd tchu',
      example: 'I look forward to seeing you.', examplePt: 'Estou ansioso pra te ver.',
      tip: 'Depois vem verbo com -ing: "look forward to seeing", nunca "to see".' },

    { pv: 'set up', pt: 'montar, configurar', group: 'estudo e trabalho', pron: 'sét âp',
      example: 'Can you help me set up the printer?', examplePt: 'Pode me ajudar a configurar a impressora?' },

    { pv: 'sign up', pt: 'se inscrever, se cadastrar', group: 'estudo e trabalho', pron: 'sáin âp',
      example: 'You can sign up online.', examplePt: 'Você pode se inscrever online.' },

    { pv: 'fill out', pt: 'preencher (um formulário)', group: 'estudo e trabalho', pron: 'fíl áut',
      example: 'Please fill out this form.', examplePt: 'Por favor, preenche esse formulário.' },

    { pv: 'give up', pt: 'desistir', group: 'estudo e trabalho', pron: 'guív âp',
      example: 'Never give up!', examplePt: 'Nunca desista!' },

    { pv: 'give back', pt: 'devolver', group: 'estudo e trabalho', pron: 'guív bék',
      example: 'You need to give back the keys.', examplePt: 'Você precisa devolver as chaves.' },

    { pv: 'run out', pt: 'acabar, ficar sem (algo)', group: 'estudo e trabalho', pron: 'rân áut',
      example: 'We always run out of coffee.', examplePt: 'Nosso café sempre acaba.',
      tip: 'Com "of": run out of money/time = ficar sem dinheiro/tempo.' },

    { pv: 'check out', pt: 'dar uma olhada (em)', group: 'estudo e trabalho', pron: 'tchék áut',
      example: 'Check out this video!', examplePt: 'Dá uma olhada nesse vídeo!' }
  ]
};
