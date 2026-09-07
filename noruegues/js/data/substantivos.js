// Norueguês (bokmål) para brasileiros — substantivos do dia a dia.
//
// A pedra no sapato do norueguês são os TRÊS gêneros (en / ei / et) e o artigo
// definido que vai GRUDADO no fim da palavra (bilen, huset, jenta). Cada
// substantivo vira duas cartas: "um carro" → en bil e "o carro" → bilen.
//
// `g`: 'm' (en), 'f' (ei) ou 'n' (et). Todo feminino também pode ir com `en`
// no bokmål (en jente / jenten) — a carta aceita as duas grafias e a canônica
// é a forma em -a, que é a que se OUVE em Oslo (jenta, boka, døra).
// `def`: só quando a forma definida não é o padrão (noun + en / a / et).
//
// `ex` deve conter o substantivo cru (o check verifica) e `exDef` a forma
// definida exata. Pronúncia como em verbos.js (rr = h aspirado, ê em ø,
// ü em y, o longo = u, å = ô). O -et definido é mudo: huset = rrûsse.

window.DATA_NO_SUBSTANTIVOS = {
  nouns: [
    /* -------------------------------------------------------- pessoas ---- */

    { n: 'jente', g: 'f', pt: 'menina', ptDef: 'a menina', pron: 'iénte', pronDef: 'iénta',
      ex: 'Hun er ei snill jente.', exPt: 'Ela é uma menina legal.',
      exDef: 'Jenta heter Ida.', exDefPt: 'A menina se chama Ida.' },

    { n: 'gutt', g: 'm', pt: 'menino', ptDef: 'o menino', pron: 'gút', pronDef: 'gúten',
      ex: 'En gutt spiller ute.', exPt: 'Um menino está brincando lá fora.',
      exDef: 'Gutten er ti år.', exDefPt: 'O menino tem dez anos.' },

    { n: 'mann', g: 'm', pt: 'homem', ptDef: 'o homem', pron: 'mán', pronDef: 'mánen',
      ex: 'Han er en snill mann.', exPt: 'Ele é um homem legal.',
      exDef: 'Mannen bor her.', exDefPt: 'O homem mora aqui.' },

    { n: 'kvinne', g: 'm', defAlts: ['kvinna'], indefAlts: ['ei kvinne'],
      pt: 'mulher', ptDef: 'a mulher', pron: 'kvíne', pronDef: 'kvínen',
      ex: 'En kvinne ventet på bussen.', exPt: 'Uma mulher esperava o ônibus.',
      exDef: 'Kvinnen snakker norsk.', exDefPt: 'A mulher fala norueguês.' },

    { n: 'barn', g: 'n', pt: 'criança', ptDef: 'a criança', pron: 'bárn', pronDef: 'bárne',
      ex: 'De har et barn.', exPt: 'Eles têm um filho.',
      exDef: 'Barnet sover.', exDefPt: 'A criança está dormindo.' },

    { n: 'venn', g: 'm', pt: 'amigo', ptDef: 'o amigo', pron: 'vén', pronDef: 'vénen',
      ex: 'Han er en god venn.', exPt: 'Ele é um bom amigo.',
      exDef: 'Vennen min bor i Rio.', exDefPt: 'Meu amigo mora no Rio.' },

    { n: 'familie', g: 'm', pt: 'família', ptDef: 'a família', pron: 'famílie', pronDef: 'famílien',
      ex: 'Jeg har en stor familie.', exPt: 'Tenho uma família grande.',
      exDef: 'Familien er fra Brasil.', exDefPt: 'A família é do Brasil.' },

    { n: 'mor', g: 'm', defAlts: ['mora'], indefAlts: ['ei mor'],
      pt: 'mãe', ptDef: 'a mãe', pron: 'múr', pronDef: 'múren',
      ex: 'Hun er en god mor.', exPt: 'Ela é uma boa mãe.',
      exDef: 'Moren min er lærer.', exDefPt: 'Minha mãe é professora.' },

    { n: 'far', g: 'm', pt: 'pai', ptDef: 'o pai', pron: 'fár', pronDef: 'fáren',
      ex: 'Han er en stolt far.', exPt: 'Ele é um pai orgulhoso.',
      exDef: 'Faren min er norsk.', exDefPt: 'Meu pai é norueguês.' },

    /* ----------------------------------------------------------- casa ---- */

    { n: 'hus', g: 'n', pt: 'casa', ptDef: 'a casa', pron: 'rrûs', pronDef: 'rrûsse',
      ex: 'Vi kjøpte et hus.', exPt: 'A gente comprou uma casa.',
      exDef: 'Huset er stort.', exDefPt: 'A casa é grande.' },

    { n: 'rom', g: 'n', def: 'rommet', pt: 'quarto', ptDef: 'o quarto', pron: 'rúm', pronDef: 'rúme',
      ex: 'Jeg vil ha et rom.', exPt: 'Quero um quarto.',
      exDef: 'Rommet er lyst.', exDefPt: 'O quarto é claro.' },

    { n: 'kjøkken', g: 'n', pt: 'cozinha', ptDef: 'a cozinha', pron: 'chêken', pronDef: 'chêkene',
      ex: 'Vi har et lite kjøkken.', exPt: 'A gente tem uma cozinha pequena.',
      exDef: 'Kjøkkenet er rent.', exDefPt: 'A cozinha está limpa.' },

    { n: 'dør', g: 'f', pt: 'porta', ptDef: 'a porta', pron: 'dêr', pronDef: 'dêra',
      ex: 'Det er ei dør der.', exPt: 'Tem uma porta ali.',
      exDef: 'Døra er åpen.', exDefPt: 'A porta está aberta.' },

    { n: 'vindu', g: 'n', pt: 'janela', ptDef: 'a janela', pron: 'víndu', pronDef: 'víndue',
      ex: 'Rommet har et vindu.', exPt: 'O quarto tem uma janela.',
      exDef: 'Vinduet er lukket.', exDefPt: 'A janela está fechada.' },

    { n: 'bord', g: 'n', pt: 'mesa', ptDef: 'a mesa', pron: 'búr', pronDef: 'búre',
      ex: 'Vi trenger et bord.', exPt: 'A gente precisa de uma mesa.',
      exDef: 'Bordet er dekket.', exDefPt: 'A mesa está posta.' },

    { n: 'stol', g: 'm', pt: 'cadeira', ptDef: 'a cadeira', pron: 'stúl', pronDef: 'stúlen',
      ex: 'Ta en stol!', exPt: 'Pega uma cadeira!',
      exDef: 'Stolen er ledig.', exDefPt: 'A cadeira está livre.' },

    { n: 'seng', g: 'f', pt: 'cama', ptDef: 'a cama', pron: 'séng', pronDef: 'sénga',
      ex: 'Det er ei seng der.', exPt: 'Tem uma cama ali.',
      exDef: 'Senga er myk.', exDefPt: 'A cama é macia.' },

    { n: 'nøkkel', g: 'm', def: 'nøkkelen', pt: 'chave', ptDef: 'a chave', pron: 'nêkel', pronDef: 'nêkelen',
      ex: 'Jeg har en nøkkel.', exPt: 'Tenho uma chave.',
      exDef: 'Nøkkelen ligger på bordet.', exDefPt: 'A chave está na mesa.' },

    { n: 'klokke', g: 'f', pt: 'relógio', ptDef: 'o relógio', pron: 'klóke', pronDef: 'klóka',
      ex: 'Jeg trenger ei klokke.', exPt: 'Preciso de um relógio.',
      exDef: 'Klokka er tre.', exDefPt: 'São três horas.' },

    { n: 'bok', g: 'f', pt: 'livro', ptDef: 'o livro', pron: 'búk', pronDef: 'búka',
      ex: 'Jeg leser ei bok.', exPt: 'Estou lendo um livro.',
      exDef: 'Boka er god.', exDefPt: 'O livro é bom.' },

    /* --------------------------------------------------- comer e beber ---- */

    { n: 'kaffe', g: 'm', pt: 'café', ptDef: 'o café', pron: 'káfe', pronDef: 'káfen',
      ex: 'Vil du ha en kaffe?', exPt: 'Quer um café?',
      exDef: 'Kaffen er varm.', exDefPt: 'O café está quente.' },

    { n: 'vann', g: 'n', pt: 'água', ptDef: 'a água', pron: 'ván', pronDef: 'váne',
      ex: 'Kan jeg få et glass vann?', exPt: 'Me vê um copo d’água?',
      exDef: 'Vannet er kaldt.', exDefPt: 'A água está gelada.' },

    { n: 'brød', g: 'n', pt: 'pão', ptDef: 'o pão', pron: 'brê', pronDef: 'brêe',
      ex: 'Vi trenger et brød.', exPt: 'A gente precisa de um pão.',
      exDef: 'Brødet er ferskt.', exDefPt: 'O pão está fresco.' },

    { n: 'ost', g: 'm', pt: 'queijo', ptDef: 'o queijo', pron: 'úst', pronDef: 'ústen',
      ex: 'Jeg kjøpte en ost.', exPt: 'Comprei um queijo.',
      exDef: 'Osten er god.', exDefPt: 'O queijo é bom.' },

    { n: 'eple', g: 'n', def: 'eplet', pt: 'maçã', ptDef: 'a maçã', pron: 'éple', pronDef: 'éple',
      ex: 'Jeg spiser et eple.', exPt: 'Estou comendo uma maçã.',
      exDef: 'Eplet er rødt.', exDefPt: 'A maçã é vermelha.' },

    /* --------------------------------------------------------- bichos ---- */

    { n: 'hund', g: 'm', pt: 'cachorro', ptDef: 'o cachorro', pron: 'rrûn', pronDef: 'rrûnen',
      ex: 'De har en hund.', exPt: 'Eles têm um cachorro.',
      exDef: 'Hunden heter Rex.', exDefPt: 'O cachorro se chama Rex.' },

    { n: 'katt', g: 'm', pt: 'gato', ptDef: 'o gato', pron: 'kát', pronDef: 'káten',
      ex: 'Jeg vil ha en katt.', exPt: 'Quero um gato.',
      exDef: 'Katten sover.', exDefPt: 'O gato está dormindo.' },

    /* ----------------------------------------------------------- tempo ---- */

    { n: 'dag', g: 'm', pt: 'dia', ptDef: 'o dia', pron: 'dág', pronDef: 'dáguen',
      ex: 'Det er en fin dag.', exPt: 'Está um dia bonito.',
      exDef: 'Dagen er lang.', exDefPt: 'O dia é longo.' },

    { n: 'natt', g: 'm', defAlts: ['natta'], indefAlts: ['ei natt'],
      pt: 'noite', ptDef: 'a noite', pron: 'nát', pronDef: 'náten',
      ex: 'Det var en lang natt.', exPt: 'Foi uma noite longa.',
      exDef: 'Natten er kald.', exDefPt: 'A noite está fria.' },

    { n: 'uke', g: 'f', pt: 'semana', ptDef: 'a semana', pron: 'ûke', pronDef: 'ûka',
      ex: 'Jeg er her ei uke.', exPt: 'Fico aqui uma semana.',
      exDef: 'Uka går fort.', exDefPt: 'A semana passa rápido.' },

    { n: 'år', g: 'n', pt: 'ano', ptDef: 'o ano', pron: 'ôr', pronDef: 'ôre',
      ex: 'Jeg bodde der et år.', exPt: 'Morei lá um ano.',
      exDef: 'Året går fort.', exDefPt: 'O ano passa rápido.' },

    /* ---------------------------------------------------- lá fora ---- */

    { n: 'by', g: 'm', pt: 'cidade', ptDef: 'a cidade', pron: 'bü', pronDef: 'büen',
      ex: 'Oslo er en fin by.', exPt: 'Oslo é uma cidade bonita.',
      exDef: 'Byen er stille i dag.', exDefPt: 'A cidade está calma hoje.' },

    { n: 'land', g: 'n', pt: 'país', ptDef: 'o país', pron: 'lán', pronDef: 'láne',
      ex: 'Norge er et lite land.', exPt: 'A Noruega é um país pequeno.',
      exDef: 'Landet er vakkert.', exDefPt: 'O país é lindo.' },

    { n: 'jobb', g: 'm', pt: 'trabalho (emprego)', ptDef: 'o trabalho (emprego)', pron: 'iób', pronDef: 'ióben',
      ex: 'Jeg har en ny jobb.', exPt: 'Tenho um trabalho novo.',
      exDef: 'Jobben er gøy.', exDefPt: 'O trabalho é legal.' },

    { n: 'skole', g: 'm', pt: 'escola', ptDef: 'a escola', pron: 'skúle', pronDef: 'skúlen',
      ex: 'Det er en skole her.', exPt: 'Tem uma escola aqui.',
      exDef: 'Skolen begynner klokka åtte.', exDefPt: 'A escola começa às oito.' },

    { n: 'butikk', g: 'm', pt: 'loja', ptDef: 'a loja', pron: 'butík', pronDef: 'butíken',
      ex: 'Det er en butikk der.', exPt: 'Tem uma loja ali.',
      exDef: 'Butikken er åpen.', exDefPt: 'A loja está aberta.' },

    { n: 'tog', g: 'n', pt: 'trem', ptDef: 'o trem', pron: 'tôg', pronDef: 'tôgue',
      ex: 'Vi tar et tog.', exPt: 'A gente pega um trem.',
      exDef: 'Toget er i rute.', exDefPt: 'O trem está no horário.' },

    { n: 'buss', g: 'm', pt: 'ônibus', ptDef: 'o ônibus', pron: 'bús', pronDef: 'bússen',
      ex: 'Det kommer en buss.', exPt: 'Vem um ônibus aí.',
      exDef: 'Bussen er full.', exDefPt: 'O ônibus está cheio.' },

    { n: 'fly', g: 'n', pt: 'avião', ptDef: 'o avião', pron: 'flü', pronDef: 'flüe',
      ex: 'Jeg så et fly.', exPt: 'Vi um avião.',
      exDef: 'Flyet er forsinket.', exDefPt: 'O avião está atrasado.' },

    { n: 'sol', g: 'f', pt: 'sol', ptDef: 'o sol', pron: 'súl', pronDef: 'súla',
      ex: 'Det er sol i dag.', exPt: 'Está fazendo sol hoje.',
      exDef: 'Sola skinner.', exDefPt: 'O sol está brilhando.' },

    { n: 'fjell', g: 'n', pt: 'montanha', ptDef: 'a montanha', pron: 'fiél', pronDef: 'fiéle',
      ex: 'Vi gikk opp et fjell.', exPt: 'A gente subiu uma montanha.',
      exDef: 'Fjellet er høyt.', exDefPt: 'A montanha é alta.' },

    { n: 'hytte', g: 'f', pt: 'cabana (de montanha ou praia)', ptDef: 'a cabana', pron: 'rrüte', pronDef: 'rrüta',
      ex: 'De har ei hytte.', exPt: 'Eles têm uma cabana.',
      exDef: 'Hytta ligger ved sjøen.', exDefPt: 'A cabana fica na beira do mar.' },

    { n: 'strand', g: 'f', pt: 'praia', ptDef: 'a praia', pron: 'stránd', pronDef: 'strána',
      ex: 'Det er ei strand her.', exPt: 'Tem uma praia aqui.',
      exDef: 'Stranda er full.', exDefPt: 'A praia está cheia.' },

    { n: 'språk', g: 'n', pt: 'língua (idioma)', ptDef: 'a língua (idioma)', pron: 'sprôk', pronDef: 'sprôke',
      ex: 'Norsk er et vanskelig språk.', exPt: 'Norueguês é uma língua difícil.',
      exDef: 'Språket er vakkert.', exDefPt: 'A língua é bonita.' }
  ]
};
