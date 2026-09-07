// Norueguês (bokmål) para brasileiros — as frases que salvam o dia.
//
// Uma carta por frase. `pt` identifica UMA frase norueguesa sem ambiguidade
// (daí "Boa noite (chegando)" = God kveld vs "Boa noite (indo dormir)" =
// God natt). `alts` são outras formas correntes, aceitas mas não canônicas.
// `example` é um mini-diálogo que CONTÉM a frase (o check verifica), com a
// tradução carioca em `examplePt`. Pronúncia como em verbos.js.

window.DATA_NO_FRASES = {
  groups: ['cumprimentos', 'educação', 'se apresentar', 'no dia a dia'],

  cards: [
    /* --------------------------------------------------- cumprimentos ---- */

    { no: 'Hei', alts: ['hallo'], pt: 'Oi / olá', group: 'cumprimentos', pron: 'rrái',
      example: '— Hei! — Hei, hvordan går det?', examplePt: '— Oi! — Oi, como vai?' },

    { no: 'God morgen', pt: 'Bom dia (de manhã)', group: 'cumprimentos', pron: 'gu mórn',
      example: '— God morgen! Sov du godt?', examplePt: '— Bom dia! Dormiu bem?' },

    { no: 'God dag', pt: 'Bom dia (formal, o dia todo)', group: 'cumprimentos', pron: 'gu dág',
      example: '— God dag! Kan jeg hjelpe deg?', examplePt: '— Bom dia! Posso ajudar?',
      tip: 'É o cumprimento de balcão e de gente mais velha. Entre amigos, "hei".' },

    { no: 'God kveld', pt: 'Boa noite (chegando)', group: 'cumprimentos', pron: 'gu kvél',
      example: '— God kveld! Velkommen inn.', examplePt: '— Boa noite! Entra aí.' },

    { no: 'God natt', pt: 'Boa noite (indo dormir)', group: 'cumprimentos', pron: 'gu nát',
      example: '— God natt! Vi ses i morgen.', examplePt: '— Boa noite! A gente se vê amanhã.' },

    { no: 'Ha det', alts: ['ha det bra'], pt: 'Tchau', group: 'cumprimentos', pron: 'rrá de',
      example: '— Ha det! — Ha det bra!', examplePt: '— Tchau! — Tchau, fica bem!',
      tip: 'Literalmente "tenha-o (bem)". "Ha det bra" é o tchau completo.' },

    { no: 'Vi ses', pt: 'A gente se vê', group: 'cumprimentos', pron: 'ví sês',
      example: '— Vi ses på fredag! — Ja, vi ses!', examplePt: '— A gente se vê na sexta! — Isso, a gente se vê!' },

    { no: 'Velkommen', pt: 'Bem-vindo', group: 'cumprimentos', pron: 'velkómen',
      example: '— Velkommen til Norge!', examplePt: '— Bem-vindo à Noruega!' },

    { no: 'God helg', pt: 'Bom fim de semana', group: 'cumprimentos', pron: 'gu rrélg',
      example: '— God helg! — Takk, i like måte!', examplePt: '— Bom fim de semana! — Valeu, pra você também!' },

    { no: 'God tur', pt: 'Boa viagem', group: 'cumprimentos', pron: 'gu tûr',
      example: '— God tur til Rio!', examplePt: '— Boa viagem pro Rio!' },

    /* ------------------------------------------------------- educação ---- */

    { no: 'Takk', pt: 'Obrigado', group: 'educação', pron: 'ták',
      example: '— Her er kaffen din. — Takk!', examplePt: '— Aqui está o seu café. — Obrigado!' },

    { no: 'Tusen takk', alts: ['takk skal du ha', 'mange takk'], pt: 'Muito obrigado', group: 'educação', pron: 'tûssen ták',
      example: '— Tusen takk for hjelpen!', examplePt: '— Muito obrigado pela ajuda!',
      tip: 'Literalmente "mil obrigados".' },

    { no: 'Bare hyggelig', alts: ['vær så god'], pt: 'De nada', group: 'educação', pron: 'báre rrügueli',
      example: '— Takk for maten! — Bare hyggelig!', examplePt: '— Obrigado pela comida! — De nada!' },

    { no: 'Vær så snill', pt: 'Por favor', group: 'educação', pron: 'vér sô sníl',
      example: '— Kan du hjelpe meg, vær så snill?', examplePt: '— Pode me ajudar, por favor?',
      tip: 'Norueguês usa menos "por favor" que português — um "takk" no fim do pedido já é educado.' },

    { no: 'Unnskyld', pt: 'Desculpa / com licença', group: 'educação', pron: 'ûnchül',
      example: '— Unnskyld, hvor er stasjonen?', examplePt: '— Com licença, onde fica a estação?' },

    { no: 'Beklager', pt: 'Sinto muito (lamento)', group: 'educação', pron: 'beklá-guer',
      example: '— Beklager, jeg kom for sent.', examplePt: '— Desculpa, cheguei atrasado.' },

    { no: 'Ja', pt: 'Sim', group: 'educação', pron: 'iá',
      example: '— Vil du ha kaffe? — Ja, takk!', examplePt: '— Quer café? — Sim, por favor!' },

    { no: 'Nei', pt: 'Não', group: 'educação', pron: 'nái',
      example: '— Er du sliten? — Nei, det går bra.', examplePt: '— Está cansado? — Não, tá tudo bem.' },

    { no: 'Skål', pt: 'Saúde! (brinde)', group: 'educação', pron: 'skôl',
      example: '— Skål for Brasil!', examplePt: '— Um brinde ao Brasil!' },

    { no: 'Gratulerer med dagen', pt: 'Feliz aniversário', group: 'educação', pron: 'gratulêrer mé dáguen',
      example: '— Gratulerer med dagen, Ana!', examplePt: '— Feliz aniversário, Ana!',
      tip: 'Literalmente "parabéns pelo dia". Também é o que se diz no 17 de maio, o dia nacional.' },

    { no: 'Gratulerer', pt: 'Parabéns', group: 'educação', pron: 'gratulêrer',
      example: '— Jeg fikk jobben! — Gratulerer!', examplePt: '— Consegui o emprego! — Parabéns!' },

    { no: 'Lykke til', pt: 'Boa sorte', group: 'educação', pron: 'lüke tíl',
      example: '— Lykke til på eksamen!', examplePt: '— Boa sorte na prova!' },

    { no: 'Et øyeblikk', pt: 'Um momento', group: 'educação', pron: 'et êie-blík',
      example: '— Et øyeblikk, jeg kommer straks.', examplePt: '— Um momento, já volto.' },

    /* ------------------------------------------------- se apresentar ---- */

    { no: 'Hva heter du?', pt: 'Qual é o seu nome?', group: 'se apresentar', pron: 'vá rrêter dû',
      example: '— Hva heter du? — Jeg heter Ana.', examplePt: '— Qual é o seu nome? — Meu nome é Ana.' },

    { no: 'Jeg heter Ana', pt: 'Meu nome é Ana', group: 'se apresentar', pron: 'iái rrêter Ana',
      example: '— Hei, jeg heter Ana. — Hyggelig!', examplePt: '— Oi, meu nome é Ana. — Prazer!' },

    { no: 'Hyggelig', alts: ['hyggelig å møte deg', 'hyggelig å treffe deg'], pt: 'Prazer (em conhecer)', group: 'se apresentar', pron: 'rrügueli',
      example: '— Jeg heter Lars. — Hyggelig! Jeg heter Ana.', examplePt: '— Meu nome é Lars. — Prazer! Meu nome é Ana.' },

    { no: 'Hvor kommer du fra?', alts: ['hvor er du fra'], pt: 'De onde você é?', group: 'se apresentar', pron: 'vúr kómer dû frá',
      example: '— Hvor kommer du fra? — Fra Rio.', examplePt: '— De onde você é? — Do Rio.' },

    { no: 'Jeg kommer fra Brasil', alts: ['jeg er fra Brasil'], pt: 'Eu sou do Brasil', group: 'se apresentar', pron: 'iái kómer frá brassíl',
      example: '— Jeg kommer fra Brasil, fra Rio.', examplePt: '— Eu sou do Brasil, do Rio.' },

    { no: 'Hvor bor du?', pt: 'Onde você mora?', group: 'se apresentar', pron: 'vúr búr dû',
      example: '— Hvor bor du? — I Oslo.', examplePt: '— Onde você mora? — Em Oslo.' },

    { no: 'Jeg bor i Rio', pt: 'Eu moro no Rio', group: 'se apresentar', pron: 'iái búr i Rio',
      example: '— Jeg bor i Rio, ved stranda.', examplePt: '— Eu moro no Rio, perto da praia.' },

    { no: 'Hvordan går det?', alts: ['hvordan har du det'], pt: 'Como você está?', group: 'se apresentar', pron: 'vúrdan gôr dê',
      example: '— Hvordan går det? — Bare bra, takk!', examplePt: '— Como você está? — Tudo bem, obrigado!',
      tip: 'Literalmente "como vai isso?". A resposta padrão é "bare bra".' },

    { no: 'Bare bra, takk', alts: ['det går bra'], pt: 'Tudo bem, obrigado', group: 'se apresentar', pron: 'báre brá, ták',
      example: '— Går det bra? — Bare bra, takk. Og du?', examplePt: '— Tudo bem? — Tudo bem, obrigado. E você?' },

    { no: 'Snakker du engelsk?', pt: 'Você fala inglês?', group: 'se apresentar', pron: 'snáker dû éngelsk',
      example: '— Snakker du engelsk? — Ja, litt.', examplePt: '— Você fala inglês? — Sim, um pouco.' },

    { no: 'Jeg snakker litt norsk', pt: 'Eu falo um pouco de norueguês', group: 'se apresentar', pron: 'iái snáker lít nórsk',
      example: '— Jeg snakker litt norsk, men ikke så bra.', examplePt: '— Eu falo um pouco de norueguês, mas não muito bem.' },

    /* ---------------------------------------------------- no dia a dia ---- */

    { no: 'Jeg forstår ikke', alts: ['jeg skjønner ikke'], pt: 'Eu não entendo', group: 'no dia a dia', pron: 'iái forstôr íke',
      example: '— Beklager, jeg forstår ikke. Kan du si det igjen?', examplePt: '— Desculpa, eu não entendo. Pode repetir?' },

    { no: 'Jeg vet ikke', pt: 'Eu não sei', group: 'no dia a dia', pron: 'iái vêt íke',
      example: '— Når kommer bussen? — Jeg vet ikke.', examplePt: '— Quando vem o ônibus? — Não sei.' },

    { no: 'Hva sa du?', pt: 'O que você disse?', group: 'no dia a dia', pron: 'vá sá dû',
      example: '— Hva sa du? Jeg hørte ikke.', examplePt: '— O que você disse? Não ouvi.' },

    { no: 'Hva koster det?', alts: ['hvor mye koster det'], pt: 'Quanto custa?', group: 'no dia a dia', pron: 'vá kóster dê',
      example: '— Hva koster det? — Femti kroner.', examplePt: '— Quanto custa? — Cinquenta coroas.' },

    { no: 'Hvor er toalettet?', alts: ['hvor er do'], pt: 'Onde fica o banheiro?', group: 'no dia a dia', pron: 'vúr ér tualéte',
      example: '— Unnskyld, hvor er toalettet? — Der borte.', examplePt: '— Com licença, onde fica o banheiro? — Ali.' },

    { no: 'Greit', alts: ['ok', 'det er greit'], pt: 'Está bem / beleza (concordando)', group: 'no dia a dia', pron: 'gráit',
      example: '— Vi møtes klokka seks? — Greit!', examplePt: '— A gente se encontra às seis? — Beleza!' },

    { no: 'Jeg vil ha en kaffe', pt: 'Eu quero um café', group: 'no dia a dia', pron: 'iái víl rrá en káfe',
      example: '— Jeg vil ha en kaffe, takk.', examplePt: '— Eu quero um café, por favor.' },

    { no: 'En øl, takk', pt: 'Uma cerveja, por favor', group: 'no dia a dia', pron: 'en êl, ták',
      example: '— En øl, takk! — Stor eller liten?', examplePt: '— Uma cerveja, por favor! — Grande ou pequena?' },

    { no: 'Regningen, takk', alts: ['kan jeg få regningen'], pt: 'A conta, por favor', group: 'no dia a dia', pron: 'ráininguen, ták',
      example: '— Regningen, takk! — Skal dere dele?', examplePt: '— A conta, por favor! — Vão dividir?' },

    { no: 'Hva er klokka?', alts: ['hva er klokken'], pt: 'Que horas são?', group: 'no dia a dia', pron: 'vá ér klóka',
      example: '— Hva er klokka? — Halv tre.', examplePt: '— Que horas são? — Duas e meia.',
      tip: '"Halv tre" é duas e meia — meia hora ANTES das três, não depois das duas.' },

    { no: 'Jeg er sulten', pt: 'Estou com fome', group: 'no dia a dia', pron: 'iái ér sûlten',
      example: '— Jeg er sulten. Skal vi spise?', examplePt: '— Estou com fome. Vamos comer?' },

    { no: 'Jeg er tørst', pt: 'Estou com sede', group: 'no dia a dia', pron: 'iái ér têrst',
      example: '— Jeg er tørst. Har du vann?', examplePt: '— Estou com sede. Tem água?' },

    { no: 'Jeg er sliten', alts: ['jeg er trøtt'], pt: 'Estou cansado', group: 'no dia a dia', pron: 'iái ér slíten',
      example: '— Jeg er sliten, jeg går hjem.', examplePt: '— Estou cansado, vou pra casa.' },

    { no: 'Det er kaldt i dag', pt: 'Está frio hoje', group: 'no dia a dia', pron: 'dê ér kált i dág',
      example: '— Det er kaldt i dag! — Ja, minus ti.', examplePt: '— Está frio hoje! — É, dez negativos.' },

    { no: 'Jeg elsker deg', pt: 'Eu te amo', group: 'no dia a dia', pron: 'iái élsker dái',
      example: '— Jeg elsker deg. — Jeg elsker deg også.', examplePt: '— Eu te amo. — Eu também te amo.' },

    { no: 'Jeg liker deg', pt: 'Eu gosto de você', group: 'no dia a dia', pron: 'iái líker dái',
      example: '— Jeg liker deg veldig godt.', examplePt: '— Eu gosto muito de você.' },

    { no: 'Så bra', alts: ['så fint'], pt: 'Que bom! / Que legal!', group: 'no dia a dia', pron: 'sô brá',
      example: '— Jeg fikk jobben! — Så bra!', examplePt: '— Consegui o emprego! — Que bom!' },

    { no: 'Hjelp', pt: 'Socorro!', group: 'no dia a dia', pron: 'iélp',
      example: '— Hjelp! Jeg har mistet lommeboka!', examplePt: '— Socorro! Perdi a carteira!' }
  ]
};
