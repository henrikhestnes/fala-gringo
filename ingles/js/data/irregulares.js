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
// vs "fazer (criar, produzir)" — todo gloss novo tem que ficar único na lista.
//
// Os exemplos são frases americanas do dia a dia com tradução em português
// carioca — o mesmo estilo falado do resto do Fala Gringo. Cada exemplo
// precisa conter a forma que a carta ensina (o check verifica).
//
// Verbos regulares no inglês americano (learn/learned, dream/dreamed,
// burn/burned…) ficam de fora de propósito.

window.DATA_EN_IRREGULARES = {
  groups: ['passado', 'particípio'],

  verbs: [
    /* ------------------------------------------------------ o núcleo ---- */

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

    { base: 'get', pt: 'conseguir, obter',
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
      examplePart: 'I have thought a lot about it.', examplePartPt: 'Já pensei muito nisso.' },

    /* ------------------------------------------- o resto, em ordem A–Z ---- */

    { base: 'become', pt: 'virar, tornar-se',
      past: 'became', pastPron: 'bikêim',
      examplePast: 'She became a doctor.', examplePastPt: 'Ela virou médica.',
      part: 'become', partPron: 'bikâm',
      examplePart: 'He has become famous.', examplePartPt: 'Ele ficou famoso.' },

    { base: 'begin', pt: 'começar',
      past: 'began', pastPron: 'biguén',
      examplePast: 'The movie began late.', examplePastPt: 'O filme começou tarde.',
      part: 'begun', partPron: 'bigân',
      examplePart: 'The show has begun.', examplePartPt: 'O show já começou.' },

    { base: 'bite', pt: 'morder',
      past: 'bit', pastPron: 'bít',
      examplePast: 'The dog bit my leg.', examplePastPt: 'O cachorro mordeu minha perna.',
      part: 'bitten', partPron: 'bíten',
      examplePart: 'I have bitten my tongue.', examplePartPt: 'Mordi a língua.' },

    { base: 'break', pt: 'quebrar',
      past: 'broke', pastPron: 'brôuk',
      examplePast: 'I broke my phone.', examplePastPt: 'Quebrei meu celular.',
      part: 'broken', partPron: 'brôuken',
      examplePart: 'She has broken the record.', examplePartPt: 'Ela quebrou o recorde.' },

    { base: 'bring', pt: 'trazer',
      past: 'brought', pastPron: 'brót',
      examplePast: 'He brought beer to the party.', examplePastPt: 'Ele trouxe cerveja pra festa.',
      part: 'brought', partPron: 'brót',
      examplePart: 'I have brought you a gift.', examplePartPt: 'Trouxe um presente pra você.' },

    { base: 'build', pt: 'construir',
      past: 'built', pastPron: 'bílt',
      examplePast: 'They built a house.', examplePastPt: 'Eles construíram uma casa.',
      part: 'built', partPron: 'bílt',
      examplePart: 'We have built something special.', examplePartPt: 'Construímos algo especial.' },

    { base: 'catch', pt: 'pegar (agarrar), capturar',
      past: 'caught', pastPron: 'cót',
      examplePast: 'She caught the ball.', examplePastPt: 'Ela pegou a bola.',
      part: 'caught', partPron: 'cót',
      examplePart: 'The police have caught the thief.', examplePartPt: 'A polícia pegou o ladrão.' },

    { base: 'choose', pt: 'escolher',
      past: 'chose', pastPron: 'tchôuz',
      examplePast: 'I chose the blue one.', examplePastPt: 'Escolhi o azul.',
      part: 'chosen', partPron: 'tchôuzen',
      examplePart: 'She has chosen a name.', examplePartPt: 'Ela escolheu um nome.' },

    { base: 'cost', pt: 'custar',
      past: 'cost', pastPron: 'cóst',
      examplePast: 'The ticket cost twenty dollars.', examplePastPt: 'O ingresso custou vinte dólares.',
      part: 'cost', partPron: 'cóst',
      examplePart: 'It has cost me a fortune.', examplePartPt: 'Me custou uma fortuna.' },

    { base: 'cut', pt: 'cortar',
      past: 'cut', pastPron: 'cât',
      examplePast: 'I cut my finger.', examplePastPt: 'Cortei o dedo.',
      part: 'cut', partPron: 'cât',
      examplePart: 'She has cut her hair.', examplePartPt: 'Ela cortou o cabelo.' },

    { base: 'draw', pt: 'desenhar',
      past: 'drew', pastPron: 'drú',
      examplePast: 'He drew a map.', examplePastPt: 'Ele desenhou um mapa.',
      part: 'drawn', partPron: 'drón',
      examplePart: 'She has drawn my portrait.', examplePartPt: 'Ela desenhou meu retrato.' },

    { base: 'drive', pt: 'dirigir',
      past: 'drove', pastPron: 'drôuv',
      examplePast: 'We drove to the mountains.', examplePastPt: 'Fomos de carro para as montanhas.',
      part: 'driven', partPron: 'dríven',
      examplePart: 'I have never driven a truck.', examplePartPt: 'Nunca dirigi um caminhão.' },

    { base: 'fall', pt: 'cair',
      past: 'fell', pastPron: 'fél',
      examplePast: 'She fell off the bike.', examplePastPt: 'Ela caiu da bicicleta.',
      part: 'fallen', partPron: 'fólen',
      examplePart: 'The price has fallen.', examplePartPt: 'O preço caiu.' },

    { base: 'feel', pt: 'sentir',
      past: 'felt', pastPron: 'félt',
      examplePast: 'I felt sick yesterday.', examplePastPt: 'Me senti mal ontem.',
      part: 'felt', partPron: 'félt',
      examplePart: 'Have you ever felt this way?', examplePartPt: 'Você já se sentiu assim?' },

    { base: 'fight', pt: 'lutar, brigar',
      past: 'fought', pastPron: 'fót',
      examplePast: 'They fought about money.', examplePastPt: 'Eles brigaram por dinheiro.',
      part: 'fought', partPron: 'fót',
      examplePart: 'She has fought for this her whole life.', examplePartPt: 'Ela lutou por isso a vida toda.' },

    { base: 'find', pt: 'achar, encontrar (algo)',
      past: 'found', pastPron: 'fáund',
      examplePast: 'I found my keys.', examplePastPt: 'Achei minhas chaves.',
      part: 'found', partPron: 'fáund',
      examplePart: 'Have you found a place yet?', examplePartPt: 'Você já achou um lugar?' },

    { base: 'fly', pt: 'voar',
      past: 'flew', pastPron: 'flú',
      examplePast: 'We flew to Salvador.', examplePastPt: 'Voamos para Salvador.',
      part: 'flown', partPron: 'flôun',
      examplePart: 'She has flown many times.', examplePartPt: 'Ela já voou muitas vezes.' },

    { base: 'forget', pt: 'esquecer',
      past: 'forgot', pastPron: 'forgót',
      examplePast: 'I forgot my wallet.', examplePastPt: 'Esqueci minha carteira.',
      part: 'forgotten', partPron: 'forgóten',
      examplePart: 'I have forgotten her name.', examplePartPt: 'Esqueci o nome dela.' },

    { base: 'forgive', pt: 'perdoar',
      past: 'forgave', pastPron: 'forguêiv',
      examplePast: 'She forgave him.', examplePastPt: 'Ela perdoou ele.',
      part: 'forgiven', partPron: 'forguíven',
      examplePart: 'I have forgiven you.', examplePartPt: 'Eu te perdoei.' },

    { base: 'give', pt: 'dar',
      past: 'gave', pastPron: 'guêiv',
      examplePast: 'He gave me a ride.', examplePastPt: 'Ele me deu uma carona.',
      part: 'given', partPron: 'guíven',
      examplePart: 'She has given me so much.', examplePartPt: 'Ela me deu tanta coisa.' },

    { base: 'grow', pt: 'crescer',
      past: 'grew', pastPron: 'grú',
      examplePast: 'The city grew fast.', examplePastPt: 'A cidade cresceu rápido.',
      part: 'grown', partPron: 'grôun',
      examplePart: 'My son has grown a lot.', examplePartPt: 'Meu filho cresceu muito.' },

    { base: 'hear', pt: 'ouvir',
      past: 'heard', pastPron: 'rrârd',
      examplePast: 'I heard a noise.', examplePastPt: 'Ouvi um barulho.',
      part: 'heard', partPron: 'rrârd',
      examplePart: 'Have you heard the news?', examplePartPt: 'Você soube da novidade?' },

    { base: 'hide', pt: 'esconder',
      past: 'hid', pastPron: 'rríd',
      examplePast: 'He hid the money.', examplePastPt: 'Ele escondeu o dinheiro.',
      part: 'hidden', partPron: 'rríden',
      examplePart: 'She has hidden the gifts.', examplePartPt: 'Ela escondeu os presentes.' },

    { base: 'hit', pt: 'bater (em algo)',
      past: 'hit', pastPron: 'rrít',
      examplePast: 'The car hit a pole.', examplePastPt: 'O carro bateu num poste.',
      part: 'hit', partPron: 'rrít',
      examplePart: 'The song has hit number one.', examplePartPt: 'A música chegou ao número um.' },

    { base: 'hold', pt: 'segurar',
      past: 'held', pastPron: 'rréld',
      examplePast: 'She held my hand.', examplePastPt: 'Ela segurou minha mão.',
      part: 'held', partPron: 'rréld',
      examplePart: 'He has held that job for years.', examplePartPt: 'Ele está nesse emprego há anos.' },

    { base: 'hurt', pt: 'machucar',
      past: 'hurt', pastPron: 'rrârt',
      examplePast: 'I hurt my back.', examplePastPt: 'Machuquei as costas.',
      part: 'hurt', partPron: 'rrârt',
      examplePart: 'She has hurt her knee.', examplePartPt: 'Ela machucou o joelho.' },

    { base: 'keep', pt: 'manter, guardar',
      past: 'kept', pastPron: 'képt',
      examplePast: 'I kept the receipt.', examplePastPt: 'Guardei o recibo.',
      part: 'kept', partPron: 'képt',
      examplePart: 'He has kept his promise.', examplePartPt: 'Ele cumpriu a promessa.' },

    { base: 'leave', pt: 'sair, ir embora',
      past: 'left', pastPron: 'léft',
      examplePast: 'She left early.', examplePastPt: 'Ela saiu cedo.',
      part: 'left', partPron: 'léft',
      examplePart: 'The bus has already left.', examplePartPt: 'O ônibus já foi embora.' },

    { base: 'lend', pt: 'emprestar',
      past: 'lent', pastPron: 'lént',
      examplePast: 'I lent him my bike.', examplePastPt: 'Emprestei minha bicicleta pra ele.',
      part: 'lent', partPron: 'lént',
      examplePart: 'She has lent me money before.', examplePartPt: 'Ela já me emprestou dinheiro.' },

    { base: 'let', pt: 'deixar (permitir)',
      past: 'let', pastPron: 'lét',
      examplePast: 'My mom let me go.', examplePastPt: 'Minha mãe deixou eu ir.',
      part: 'let', partPron: 'lét',
      examplePart: 'She has let me stay.', examplePartPt: 'Ela deixou eu ficar.' },

    { base: 'lose', pt: 'perder',
      past: 'lost', pastPron: 'lóst',
      examplePast: 'We lost the game.', examplePastPt: 'Perdemos o jogo.',
      part: 'lost', partPron: 'lóst',
      examplePart: 'I have lost my keys again.', examplePartPt: 'Perdi minhas chaves de novo.' },

    { base: 'mean', pt: 'significar, querer dizer',
      past: 'meant', pastPron: 'mént',
      examplePast: 'I meant to call you.', examplePastPt: 'Eu ia te ligar (era minha intenção).',
      part: 'meant', partPron: 'mént',
      examplePart: 'It has always meant a lot to me.', examplePartPt: 'Isso sempre significou muito pra mim.' },

    { base: 'meet', pt: 'encontrar (alguém), conhecer (pela 1ª vez)',
      past: 'met', pastPron: 'mét',
      examplePast: 'I met her at a party.', examplePastPt: 'Conheci ela numa festa.',
      part: 'met', partPron: 'mét',
      examplePart: 'Have we met before?', examplePartPt: 'A gente já se conheceu?' },

    { base: 'pay', pt: 'pagar',
      past: 'paid', pastPron: 'pêid',
      examplePast: 'I paid the bill.', examplePastPt: 'Paguei a conta.',
      part: 'paid', partPron: 'pêid',
      examplePart: 'She has paid the rent.', examplePartPt: 'Ela pagou o aluguel.' },

    { base: 'put', pt: 'colocar, pôr',
      past: 'put', pastPron: 'pút',
      examplePast: 'She put the keys on the table.', examplePastPt: 'Ela pôs as chaves na mesa.',
      part: 'put', partPron: 'pút',
      examplePart: 'Where have you put my phone?', examplePartPt: 'Onde você pôs meu celular?' },

    { base: 'read', pt: 'ler',
      past: 'read', pastPron: 'réd (escreve igual, o som muda)',
      examplePast: 'I read that book last year.', examplePastPt: 'Li aquele livro ano passado.',
      part: 'read', partPron: 'réd (escreve igual, o som muda)',
      examplePart: 'Have you read the message?', examplePartPt: 'Você leu a mensagem?' },

    { base: 'ride', pt: 'andar de (bicicleta, cavalo)',
      past: 'rode', pastPron: 'rôud',
      examplePast: 'He rode his bike to work.', examplePastPt: 'Ele foi de bicicleta pro trabalho.',
      part: 'ridden', partPron: 'ríden',
      examplePart: 'I have never ridden a horse.', examplePartPt: 'Nunca andei a cavalo.' },

    { base: 'run', pt: 'correr',
      past: 'ran', pastPron: 'rén',
      examplePast: 'She ran five kilometers.', examplePastPt: 'Ela correu cinco quilômetros.',
      part: 'run', partPron: 'rân',
      examplePart: 'He has run three marathons.', examplePartPt: 'Ele já correu três maratonas.' },

    { base: 'sell', pt: 'vender',
      past: 'sold', pastPron: 'sôuld',
      examplePast: 'They sold the car.', examplePastPt: 'Eles venderam o carro.',
      part: 'sold', partPron: 'sôuld',
      examplePart: 'The tickets have sold out.', examplePartPt: 'Os ingressos esgotaram.' },

    { base: 'send', pt: 'enviar, mandar',
      past: 'sent', pastPron: 'sênt',
      examplePast: 'I sent you an email.', examplePastPt: 'Te mandei um e-mail.',
      part: 'sent', partPron: 'sênt',
      examplePart: 'She has sent the invitations.', examplePartPt: 'Ela mandou os convites.' },

    { base: 'show', pt: 'mostrar',
      past: 'showed', pastPron: 'xôud',
      examplePast: 'He showed me the photos.', examplePastPt: 'Ele me mostrou as fotos.',
      part: 'shown', partPron: 'xôun', partAlts: ['showed'],
      examplePart: 'She has shown me the way.', examplePartPt: 'Ela me mostrou o caminho.' },

    { base: 'shut', pt: 'fechar',
      past: 'shut', pastPron: 'xât',
      examplePast: 'He shut the door.', examplePastPt: 'Ele fechou a porta.',
      part: 'shut', partPron: 'xât',
      examplePart: 'They have shut the road.', examplePartPt: 'Fecharam a estrada.' },

    { base: 'sing', pt: 'cantar',
      past: 'sang', pastPron: 'séng',
      examplePast: 'She sang all night.', examplePastPt: 'Ela cantou a noite toda.',
      part: 'sung', partPron: 'sâng',
      examplePart: 'He has sung in a band.', examplePartPt: 'Ele já cantou numa banda.' },

    { base: 'sit', pt: 'sentar',
      past: 'sat', pastPron: 'sét',
      examplePast: 'We sat by the window.', examplePastPt: 'Sentamos perto da janela.',
      part: 'sat', partPron: 'sét',
      examplePart: 'I have sat here for hours.', examplePartPt: 'Estou sentado aqui há horas.' },

    { base: 'sleep', pt: 'dormir',
      past: 'slept', pastPron: 'slépt',
      examplePast: 'I slept badly.', examplePastPt: 'Dormi mal.',
      part: 'slept', partPron: 'slépt',
      examplePart: 'The baby has slept all day.', examplePartPt: 'O bebê dormiu o dia todo.' },

    { base: 'speak', pt: 'falar',
      past: 'spoke', pastPron: 'spôuk',
      examplePast: 'She spoke with the manager.', examplePastPt: 'Ela falou com o gerente.',
      part: 'spoken', partPron: 'spôuken',
      examplePart: 'Have you spoken to him?', examplePartPt: 'Você falou com ele?' },

    { base: 'spend', pt: 'gastar, passar (tempo)',
      past: 'spent', pastPron: 'spênt',
      examplePast: 'I spent all my money.', examplePastPt: 'Gastei todo meu dinheiro.',
      part: 'spent', partPron: 'spênt',
      examplePart: 'We have spent the day at the beach.', examplePartPt: 'Passamos o dia na praia.' },

    { base: 'stand', pt: 'ficar de pé',
      past: 'stood', pastPron: 'stúd',
      examplePast: 'We stood in line for an hour.', examplePastPt: 'Ficamos na fila uma hora.',
      part: 'stood', partPron: 'stúd',
      examplePart: 'That building has stood for a century.', examplePartPt: 'Aquele prédio está de pé há um século.' },

    { base: 'steal', pt: 'roubar',
      past: 'stole', pastPron: 'stôul',
      examplePast: 'Someone stole my bag.', examplePastPt: 'Roubaram minha bolsa.',
      part: 'stolen', partPron: 'stôulen',
      examplePart: 'My phone has been stolen.', examplePartPt: 'Meu celular foi roubado.' },

    { base: 'swim', pt: 'nadar',
      past: 'swam', pastPron: 'suém',
      examplePast: 'We swam in the sea.', examplePastPt: 'Nadamos no mar.',
      part: 'swum', partPron: 'suâm',
      examplePart: 'She has swum across the bay.', examplePartPt: 'Ela atravessou a baía a nado.' },

    { base: 'teach', pt: 'ensinar',
      past: 'taught', pastPron: 'tót',
      examplePast: 'She taught me Portuguese.', examplePastPt: 'Ela me ensinou português.',
      part: 'taught', partPron: 'tót',
      examplePart: 'He has taught for ten years.', examplePartPt: 'Ele dá aula há dez anos.' },

    { base: 'tell', pt: 'contar, dizer (a alguém)',
      past: 'told', pastPron: 'tôuld',
      examplePast: 'He told me a secret.', examplePastPt: 'Ele me contou um segredo.',
      part: 'told', partPron: 'tôuld',
      examplePart: 'I have told you a thousand times.', examplePartPt: 'Já te falei mil vezes.' },

    { base: 'throw', pt: 'jogar, atirar (algo)',
      past: 'threw', pastPron: 'thrú (língua entre os dentes)',
      examplePast: 'He threw the ball.', examplePastPt: 'Ele jogou a bola.',
      part: 'thrown', partPron: 'thrôun (língua entre os dentes)',
      examplePart: 'She has thrown it away.', examplePartPt: 'Ela jogou isso fora.' },

    { base: 'understand', pt: 'entender',
      past: 'understood', pastPron: 'anderstúd',
      examplePast: 'I understood everything.', examplePastPt: 'Entendi tudo.',
      part: 'understood', partPron: 'anderstúd',
      examplePart: 'She has always understood me.', examplePartPt: 'Ela sempre me entendeu.' },

    { base: 'wake', pt: 'acordar',
      past: 'woke', pastPron: 'uôuk',
      examplePast: 'I woke up at six.', examplePastPt: 'Acordei às seis.',
      part: 'woken', partPron: 'uôuken',
      examplePart: 'The noise has woken the baby.', examplePartPt: 'O barulho acordou o bebê.' },

    { base: 'wear', pt: 'vestir, usar (roupa)',
      past: 'wore', pastPron: 'uór',
      examplePast: 'She wore a red dress.', examplePastPt: 'Ela usou um vestido vermelho.',
      part: 'worn', partPron: 'uórn',
      examplePart: 'I have worn this jacket for years.', examplePartPt: 'Uso essa jaqueta há anos.' },

    { base: 'win', pt: 'vencer, ganhar (jogo, prêmio)',
      past: 'won', pastPron: 'uân',
      examplePast: 'Brazil won the game.', examplePastPt: 'O Brasil ganhou o jogo.',
      part: 'won', partPron: 'uân',
      examplePart: 'She has won three times.', examplePartPt: 'Ela já ganhou três vezes.' },

    { base: 'write', pt: 'escrever',
      past: 'wrote', pastPron: 'rôut',
      examplePast: 'I wrote her a letter.', examplePastPt: 'Escrevi uma carta pra ela.',
      part: 'written', partPron: 'ríten',
      examplePart: 'He has written two books.', examplePartPt: 'Ele escreveu dois livros.' }
  ]
};
