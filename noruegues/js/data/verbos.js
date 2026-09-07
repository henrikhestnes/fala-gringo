// Norueguês (bokmål) para brasileiros — os verbos mais usados, no presente e
// no passado (preteritum).
//
// O norueguês é generoso com o iniciante: o presente tem UMA forma para todas
// as pessoas (jeg/du/han/vi/dere/de snakker) — a dificuldade está em decorar
// o passado, que é irregular nos verbos mais comuns. Uma carta por tempo.
//
// `pt` é o gancho do prompt e precisa identificar UM verbo sem ambiguidade
// (o Modo Raiz não mostra nada em norueguês) — daí os qualificadores:
// "saber (um fato)" = vite vs "conhecer (pessoa, lugar)" = kjenne,
// "acreditar, crer" = tro vs "achar (opinião, gosto)" = synes.
//
// `pastAlts`: o bokmål aceita duas grafias em muitos passados (snakket/snakka,
// sto/stod) — a canônica é a que sai no texto padrão, a outra é aceita.
//
// Pronúncia aportuguesada, pensada para ouvidos brasileiros:
//   rr = h aspirado (como "had" = rréd no /ingles/)  ·  ê em ø = e com boca de o
//   ü em y = i com boca de u  ·  å = ô (long) / ó (curto)  ·  o longo = u
//   j = i (semivogal) · kj/sj/skj = ch · d final geralmente muda (god = gu)
//   o acento marca a sílaba forte.

window.DATA_NO_VERBOS = {
  verbs: [
    /* --------------------------------------------------- os essenciais ---- */

    { inf: 'være', pt: 'ser, estar',
      pres: 'er', presPron: 'ér',
      presEx: 'Jeg er fra Brasil.', presExPt: 'Eu sou do Brasil.',
      past: 'var', pastPron: 'vár',
      pastEx: 'Det var kaldt i går.', pastExPt: 'Estava frio ontem.' },

    { inf: 'ha', pt: 'ter',
      pres: 'har', presPron: 'rrár',
      presEx: 'Har du en bil?', presExPt: 'Você tem carro?',
      past: 'hadde', pastPron: 'rráde',
      pastEx: 'Vi hadde det gøy.', pastExPt: 'A gente se divertiu.' },

    { inf: 'gjøre', pt: 'fazer',
      pres: 'gjør', presPron: 'iêr',
      presEx: 'Hva gjør du?', presExPt: 'O que você está fazendo?',
      past: 'gjorde', pastPron: 'iúrde',
      pastEx: 'Jeg gjorde det i går.', pastExPt: 'Eu fiz isso ontem.' },

    { inf: 'si', pt: 'dizer',
      pres: 'sier', presPron: 'síer',
      presEx: 'Hva sier du?', presExPt: 'O que você está dizendo?',
      past: 'sa', pastPron: 'sá',
      pastEx: 'Hun sa nei.', pastExPt: 'Ela disse não.' },

    { inf: 'gå', pt: 'ir (a pé), andar',
      pres: 'går', presPron: 'gôr',
      presEx: 'Jeg går til jobben.', presExPt: 'Eu vou a pé pro trabalho.',
      past: 'gikk', pastPron: 'iík',
      pastEx: 'Vi gikk hjem.', pastExPt: 'A gente foi pra casa.' },

    { inf: 'komme', pt: 'vir',
      pres: 'kommer', presPron: 'kómer',
      presEx: 'Kommer du i kveld?', presExPt: 'Você vem hoje à noite?',
      past: 'kom', pastPron: 'kóm',
      pastEx: 'Han kom for sent.', pastExPt: 'Ele chegou atrasado.' },

    { inf: 'se', pt: 'ver',
      pres: 'ser', presPron: 'sêr',
      presEx: 'Jeg ser deg!', presExPt: 'Estou te vendo!',
      past: 'så', pastPron: 'sô',
      pastEx: 'Vi så en film.', pastExPt: 'A gente viu um filme.' },

    { inf: 'ta', pt: 'pegar, tomar (o ônibus)',
      pres: 'tar', presPron: 'tár',
      presEx: 'Jeg tar bussen.', presExPt: 'Eu pego o ônibus.',
      past: 'tok', pastPron: 'túk',
      pastEx: 'Hun tok nøkkelen.', pastExPt: 'Ela pegou a chave.' },

    { inf: 'gi', pt: 'dar',
      pres: 'gir', presPron: 'iír',
      presEx: 'Jeg gir deg en klem.', presExPt: 'Te dou um abraço.',
      past: 'ga', pastAlts: ['gav'], pastPron: 'gá',
      pastEx: 'Han ga meg en bok.', pastExPt: 'Ele me deu um livro.' },

    { inf: 'få', pt: 'receber, ganhar (conseguir)',
      pres: 'får', presPron: 'fôr',
      presEx: 'Jeg får lønn i dag.', presExPt: 'Recebo o salário hoje.',
      past: 'fikk', pastPron: 'fík',
      pastEx: 'Jeg fikk en gave.', pastExPt: 'Ganhei um presente.' },

    { inf: 'vite', pt: 'saber (um fato)',
      pres: 'vet', presPron: 'vêt',
      presEx: 'Jeg vet ikke.', presExPt: 'Não sei.',
      past: 'visste', pastPron: 'víste',
      pastEx: 'Jeg visste det!', pastExPt: 'Eu sabia!' },

    { inf: 'kjenne', pt: 'conhecer (pessoa, lugar)',
      pres: 'kjenner', presPron: 'chéner',
      presEx: 'Kjenner du henne?', presExPt: 'Você conhece ela?',
      past: 'kjente', pastPron: 'chénte',
      pastEx: 'Jeg kjente ham godt.', pastExPt: 'Eu conhecia ele bem.' },

    /* ------------------------------------------------------- os modais ---- */

    { inf: 'kunne', pt: 'poder, saber fazer',
      pres: 'kan', presPron: 'kán',
      presEx: 'Kan du hjelpe meg?', presExPt: 'Pode me ajudar?',
      past: 'kunne', pastPron: 'kúne',
      pastEx: 'Jeg kunne ikke sove.', pastExPt: 'Não consegui dormir.' },

    { inf: 'ville', pt: 'querer',
      pres: 'vil', presPron: 'víl',
      presEx: 'Jeg vil ha en øl.', presExPt: 'Quero uma cerveja.',
      past: 'ville', pastPron: 'víle',
      pastEx: 'Han ville ikke komme.', pastExPt: 'Ele não quis vir.' },

    { inf: 'skulle', pt: 'ir (futuro: "vou fazer")',
      pres: 'skal', presPron: 'skál',
      presEx: 'Jeg skal reise i morgen.', presExPt: 'Vou viajar amanhã.',
      past: 'skulle', pastPron: 'skúle',
      pastEx: 'Vi skulle spise ute.', pastExPt: 'A gente ia comer fora.' },

    { inf: 'måtte', pt: 'ter que (obrigação)',
      pres: 'må', presPron: 'mô',
      presEx: 'Jeg må gå nå.', presExPt: 'Tenho que ir agora.',
      past: 'måtte', pastPron: 'móte',
      pastEx: 'Hun måtte jobbe.', pastExPt: 'Ela teve que trabalhar.' },

    /* ---------------------------------------------------- o dia a dia ---- */

    { inf: 'like', pt: 'gostar de',
      pres: 'liker', presPron: 'líker',
      presEx: 'Jeg liker Rio.', presExPt: 'Eu gosto do Rio.',
      past: 'likte', pastPron: 'líkte',
      pastEx: 'Jeg likte filmen.', pastExPt: 'Gostei do filme.' },

    { inf: 'snakke', pt: 'falar',
      pres: 'snakker', presPron: 'snáker',
      presEx: 'Snakker du norsk?', presExPt: 'Você fala norueguês?',
      past: 'snakket', pastAlts: ['snakka'], pastPron: 'snáket',
      pastEx: 'Vi snakket lenge.', pastExPt: 'A gente conversou bastante.' },

    { inf: 'spise', pt: 'comer',
      pres: 'spiser', presPron: 'spísser',
      presEx: 'Vi spiser klokka sju.', presExPt: 'A gente come às sete.',
      past: 'spiste', pastPron: 'spíste',
      pastEx: 'Jeg spiste pizza.', pastExPt: 'Comi pizza.' },

    { inf: 'drikke', pt: 'beber',
      pres: 'drikker', presPron: 'dríker',
      presEx: 'Jeg drikker kaffe.', presExPt: 'Eu tomo café.',
      past: 'drakk', pastPron: 'drák',
      pastEx: 'Vi drakk øl.', pastExPt: 'A gente tomou cerveja.' },

    { inf: 'bo', pt: 'morar',
      pres: 'bor', presPron: 'búr',
      presEx: 'Jeg bor i Oslo.', presExPt: 'Eu moro em Oslo.',
      past: 'bodde', pastPron: 'búde',
      pastEx: 'Vi bodde i Rio.', pastExPt: 'A gente morava no Rio.' },

    { inf: 'jobbe', pt: 'trabalhar',
      pres: 'jobber', presPron: 'ióber',
      presEx: 'Hun jobber hjemme.', presExPt: 'Ela trabalha em casa.',
      past: 'jobbet', pastAlts: ['jobba'], pastPron: 'ióbet',
      pastEx: 'Jeg jobbet hele dagen.', pastExPt: 'Trabalhei o dia todo.' },

    { inf: 'lese', pt: 'ler',
      pres: 'leser', presPron: 'lêsser',
      presEx: 'Jeg leser en bok.', presExPt: 'Estou lendo um livro.',
      past: 'leste', pastPron: 'lêste',
      pastEx: 'Han leste avisen.', pastExPt: 'Ele leu o jornal.' },

    { inf: 'skrive', pt: 'escrever',
      pres: 'skriver', presPron: 'skríver',
      presEx: 'Jeg skriver en melding.', presExPt: 'Estou escrevendo uma mensagem.',
      past: 'skrev', pastPron: 'skrêv',
      pastEx: 'Hun skrev et brev.', pastExPt: 'Ela escreveu uma carta.' },

    { inf: 'sove', pt: 'dormir',
      pres: 'sover', presPron: 'sôver',
      presEx: 'Barnet sover.', presExPt: 'A criança está dormindo.',
      past: 'sov', pastPron: 'sôv',
      pastEx: 'Jeg sov dårlig.', pastExPt: 'Dormi mal.' },

    { inf: 'kjøpe', pt: 'comprar',
      pres: 'kjøper', presPron: 'chêper',
      presEx: 'Jeg kjøper brød.', presExPt: 'Vou comprar pão.',
      past: 'kjøpte', pastPron: 'chêpte',
      pastEx: 'Vi kjøpte et hus.', pastExPt: 'A gente comprou uma casa.' },

    { inf: 'kjøre', pt: 'dirigir',
      pres: 'kjører', presPron: 'chêrer',
      presEx: 'Jeg kjører til jobben.', presExPt: 'Vou de carro pro trabalho.',
      past: 'kjørte', pastPron: 'chêrte',
      pastEx: 'Han kjørte fort.', pastExPt: 'Ele dirigiu rápido.' },

    { inf: 'betale', pt: 'pagar',
      pres: 'betaler', presPron: 'betáler',
      presEx: 'Jeg betaler.', presExPt: 'Eu pago.',
      past: 'betalte', pastPron: 'betálte',
      pastEx: 'Hun betalte regningen.', pastExPt: 'Ela pagou a conta.' },

    /* ------------------------------------------------ cabeça e coração ---- */

    { inf: 'tro', pt: 'acreditar, crer',
      pres: 'tror', presPron: 'trúr',
      presEx: 'Jeg tror det regner.', presExPt: 'Acho que vai chover.',
      past: 'trodde', pastPron: 'trúde',
      pastEx: 'Jeg trodde du var hjemme.', pastExPt: 'Achei que você estava em casa.' },

    { inf: 'synes', pt: 'achar (opinião, gosto)',
      pres: 'synes', presAlts: ['syns'], presPron: 'sünes',
      presEx: 'Jeg synes det er gøy.', presExPt: 'Acho isso divertido.',
      past: 'syntes', pastPron: 'süntes',
      pastEx: 'Jeg syntes filmen var bra.', pastExPt: 'Achei o filme bom.' },

    { inf: 'tenke', pt: 'pensar',
      pres: 'tenker', presPron: 'ténker',
      presEx: 'Jeg tenker på deg.', presExPt: 'Estou pensando em você.',
      past: 'tenkte', pastPron: 'ténkte',
      pastEx: 'Jeg tenkte det samme.', pastExPt: 'Pensei a mesma coisa.' },

    { inf: 'hete', pt: 'chamar-se',
      pres: 'heter', presPron: 'rrêter',
      presEx: 'Jeg heter Ana.', presExPt: 'Eu me chamo Ana.',
      past: 'het', pastAlts: ['hette'], pastPron: 'rrêt',
      pastEx: 'Hunden het Rex.', pastExPt: 'O cachorro se chamava Rex.' },

    { inf: 'reise', pt: 'viajar',
      pres: 'reiser', presPron: 'ráisser',
      presEx: 'Vi reiser til Norge.', presExPt: 'A gente vai viajar pra Noruega.',
      past: 'reiste', pastPron: 'ráiste',
      pastEx: 'Hun reiste i går.', pastExPt: 'Ela viajou ontem.' },

    { inf: 'lære', pt: 'aprender, ensinar',
      pres: 'lærer', presPron: 'lérer',
      presEx: 'Jeg lærer norsk.', presExPt: 'Estou aprendendo norueguês.',
      past: 'lærte', pastPron: 'lérte',
      pastEx: 'Jeg lærte mye.', pastExPt: 'Aprendi muito.' },

    { inf: 'forstå', pt: 'entender',
      pres: 'forstår', presPron: 'forstôr',
      presEx: 'Jeg forstår ikke.', presExPt: 'Não entendo.',
      past: 'forsto', pastAlts: ['forstod'], pastPron: 'forstú',
      pastEx: 'Nå forsto jeg!', pastExPt: 'Agora entendi!' },

    { inf: 'trenge', pt: 'precisar (de algo)',
      pres: 'trenger', presPron: 'tréng-er',
      presEx: 'Jeg trenger hjelp.', presExPt: 'Preciso de ajuda.',
      past: 'trengte', pastPron: 'tréngte',
      pastEx: 'Vi trengte mer tid.', pastExPt: 'A gente precisava de mais tempo.' },

    { inf: 'hjelpe', pt: 'ajudar',
      pres: 'hjelper', presPron: 'iélper',
      presEx: 'Jeg hjelper deg.', presExPt: 'Eu te ajudo.',
      past: 'hjalp', pastPron: 'iálp',
      pastEx: 'Han hjalp meg.', pastExPt: 'Ele me ajudou.' },

    { inf: 'finne', pt: 'encontrar, achar (algo)',
      pres: 'finner', presPron: 'fíner',
      presEx: 'Jeg finner ikke nøkkelen.', presExPt: 'Não acho a chave.',
      past: 'fant', pastPron: 'fánt',
      pastEx: 'Jeg fant den!', pastExPt: 'Achei!' },

    { inf: 'begynne', pt: 'começar',
      pres: 'begynner', presPron: 'be-iüner',
      presEx: 'Filmen begynner nå.', presExPt: 'O filme começa agora.',
      past: 'begynte', pastPron: 'be-iünte',
      pastEx: 'Vi begynte klokka åtte.', pastExPt: 'A gente começou às oito.' },

    { inf: 'elske', pt: 'amar',
      pres: 'elsker', presPron: 'élsker',
      presEx: 'Jeg elsker deg.', presExPt: 'Eu te amo.',
      past: 'elsket', pastAlts: ['elska'], pastPron: 'élsket',
      pastEx: 'Hun elsket Rio.', pastExPt: 'Ela amava o Rio.' },

    { inf: 'høre', pt: 'ouvir',
      pres: 'hører', presPron: 'rrêrer',
      presEx: 'Hører du meg?', presExPt: 'Está me ouvindo?',
      past: 'hørte', pastPron: 'rrêrte',
      pastEx: 'Jeg hørte ingenting.', pastExPt: 'Não ouvi nada.' },

    { inf: 'sitte', pt: 'estar sentado',
      pres: 'sitter', presPron: 'síter',
      presEx: 'Vi sitter i sofaen.', presExPt: 'A gente está sentado no sofá.',
      past: 'satt', pastPron: 'sát',
      pastEx: 'Hun satt ved vinduet.', pastExPt: 'Ela estava sentada perto da janela.' },

    { inf: 'stå', pt: 'estar de pé, ficar em pé',
      pres: 'står', presPron: 'stôr',
      presEx: 'Bussen står der.', presExPt: 'O ônibus está parado ali.',
      past: 'sto', pastAlts: ['stod'], pastPron: 'stú',
      pastEx: 'Jeg sto i kø.', pastExPt: 'Fiquei na fila.' },

    { inf: 'spille', pt: 'jogar, tocar (instrumento)',
      pres: 'spiller', presPron: 'spíler',
      presEx: 'Han spiller fotball.', presExPt: 'Ele joga futebol.',
      past: 'spilte', pastPron: 'spílte',
      pastEx: 'Vi spilte gitar.', pastExPt: 'A gente tocou violão.' }
  ]
};
