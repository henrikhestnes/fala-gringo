// Card data for the 'pronominal' topic: verbos pronominais — reflexive and
// reciprocal verbs and their clitic pronouns (eu ME · você SE · nós NOS ·
// vocês SE), in the você-register paradigm used everywhere in this app.
// Spoken Brazilian Portuguese puts the pronoun BEFORE the verb (próclise),
// even at the start of a sentence: "Me lembro", "Se cuida!" — the ênclise of
// European Portuguese ("Lembro-me") is deliberately absent here.
window.DATA_PRONOMINAL = {
  groups: ["pronouns", "presente", "passado", "phrases"],

  // ── Which pronoun? (fill the gap) ─────────────────────────
  gaps: [
    { en: "I get up early", pt: "Eu {me} levanto cedo", answer: "me", hint: "eu → ?", tip: "The full paradigm: eu me · você se · nós nos · vocês/eles se. In spoken Brazilian Portuguese the pronoun always comes before the verb." },
    { en: "Do you remember his name?", pt: "Você {se} lembra do nome dele?", answer: "se", hint: "você → ?", tip: "'Você' takes 'se', even though it means 'you'. In Rio you'll also hear 'te' as the object pronoun for você ('te ligo', 'te vejo') — but the reflexive that matches the você conjugation is always 'se'." },
    { en: "My name is Pedro", pt: "Eu {me} chamo Pedro", answer: "me", hint: "eu → ?", tip: "'Chamar-se' = to be called. 'Eu me chamo…' is the classic self-introduction." },
    { en: "We see each other every Sunday", pt: "Nós {nos} vemos todo domingo", answer: "nos", hint: "nós → ?", tip: "'Nos' (no accent) is the pronoun; 'nós' (with accent) is the subject. With plural subjects the meaning is often reciprocal: we see EACH OTHER." },
    { en: "They have known each other since childhood", pt: "Eles {se} conhecem desde criança", answer: "se", hint: "eles → ?", tip: "Plural 'se' is often reciprocal: eles se conhecem = they know each other, elas se amam = they love each other." },
    { en: "She gets dressed fast", pt: "Ela {se} veste rápido", answer: "se", hint: "ela → ?", tip: "'Ele' and 'ela' take 'se', exactly like 'você' — one pronoun covers the whole third person." },
    { en: "Did you all have fun at the party?", pt: "Vocês {se} divertiram na festa?", answer: "se", hint: "vocês → ?", tip: "'Vocês' takes 'se', the same pronoun as 'você' — the verb ending (-am) is what marks the plural." },
    { en: "We'll talk tomorrow", pt: "A gente {se} fala amanhã", answer: "se", hint: "a gente → ?", tip: "'A gente' (= we, in everyday speech) is grammatically third person, so it takes 'se', never 'nos': a gente se fala, a gente se vê." },
    { en: "I feel at home here", pt: "Eu {me} sinto em casa aqui", answer: "me", hint: "eu → ?", tip: "'Sentir-se' + adjective or phrase = to feel: me sinto bem, me sinto em casa." },
    { en: "We moved to Rio", pt: "Nós {nos} mudamos pro Rio", answer: "nos", hint: "nós → ?", tip: "'Mudar-se' = to move house. 'Pro' = para + o, the everyday spoken contraction." },
    { en: "He worries too much", pt: "Ele {se} preocupa demais", answer: "se", hint: "ele → ?", tip: "'Preocupar-se com' = to worry about: ele se preocupa com tudo." },
    { en: "I never forget you", pt: "Eu nunca {me} esqueço de você", answer: "me", hint: "eu → ?", tip: "Words like 'não', 'nunca' and 'já' pull the pronoun in right after them: eu nunca me esqueço. In casual speech Brazilians also drop it ('eu nunca esqueço') — both are fine." },
  ],

  // ── Conjugation drills ────────────────────────────────────
  // Forms are stored with the clitic built in, one row per person
  // (eu / você / nós / vocês), mirroring the shape of js/data/verbs.js.
  verbs: [
    {
      pt: "se chamar", en: "to be called", tip: "'Chamar-se' = to be called. Introduce yourself with 'Eu me chamo…'; ask with 'Como você se chama?'. Without the pronoun, 'chamar' just means to call (someone).",
      tenses: {
        presente: [
          { form: "me chamo", meaning: "my name is… (I am called)", pron: "mee SHAH-moo", example: "Eu me chamo Henrique, muito prazer." },
          { form: "se chama", meaning: "your name is… (you are called)", pron: "see SHAH-mah", example: "Você se chama Rafael, né?" },
          { form: "nos chamamos", meaning: "our names are… (we are called)", pron: "noosh shah-MAH-moosh", example: "Nós nos chamamos pelo apelido aqui em casa." },
          { form: "se chamam", meaning: "your names are… (you all are called)", pron: "see SHAH-mahng", example: "Como vocês se chamam?" },
        ],
      },
    },
    {
      pt: "se lembrar", en: "to remember", tip: "'Lembrar-se de' = to remember. Casual speech often drops the pronoun ('eu lembro'), but 'eu me lembro' is always right. Don't lose the 'de': me lembro DE você.",
      tenses: {
        presente: [
          { form: "me lembro", meaning: "I remember", pron: "mee LEHM-broo", example: "Eu me lembro do meu primeiro dia de aula." },
          { form: "se lembra", meaning: "you remember", pron: "see LEHM-brah", example: "Você se lembra daquela praia?" },
          { form: "nos lembramos", meaning: "we remember", pron: "noosh lehm-BRAH-moosh", example: "Nós nos lembramos de tudo até hoje." },
          { form: "se lembram", meaning: "you all remember", pron: "see LEHM-brahng", example: "Vocês se lembram do professor de matemática?" },
        ],
      },
    },
    {
      pt: "se levantar", en: "to get up", tip: "'Levantar-se' = to get up (out of bed, off a chair). Without the pronoun, 'levantar' means to lift something: levanto a caixa.",
      tenses: {
        presente: [
          { form: "me levanto", meaning: "I get up", pron: "mee leh-VAHN-too", example: "Eu me levanto às seis todo dia." },
          { form: "se levanta", meaning: "you get up", pron: "see leh-VAHN-tah", example: "Você se levanta cedo?" },
          { form: "nos levantamos", meaning: "we get up", pron: "noosh leh-vahn-TAH-moosh", example: "Nós nos levantamos tarde no domingo." },
          { form: "se levantam", meaning: "you all get up", pron: "see leh-VAHN-tahng", example: "Vocês se levantam a que horas?" },
        ],
        perfeito: [
          { form: "me levantei", meaning: "I got up", pron: "mee leh-vahn-TAY", example: "Eu me levantei atrasado hoje." },
          { form: "se levantou", meaning: "you got up", pron: "see leh-vahn-TOH", example: "Você se levantou cedo ontem?" },
          { form: "nos levantamos", meaning: "we got up", pron: "noosh leh-vahn-TAH-moosh", example: "Nós nos levantamos antes do sol nascer." },
          { form: "se levantaram", meaning: "you all got up", pron: "see leh-vahn-TAH-rahng", example: "Vocês se levantaram tarde de novo?" },
        ],
      },
    },
    {
      pt: "se sentir", en: "to feel", irregular: true, tip: "'Sentir-se' + adjective = to feel (well, tired, at home). With a noun there's no pronoun: sinto saudade, sinto frio. e→i verb: eu me SINTO, but você se SENTE.",
      tenses: {
        presente: [
          { form: "me sinto", meaning: "I feel", pron: "mee SEEN-too", example: "Eu me sinto muito bem aqui." },
          { form: "se sente", meaning: "you feel", pron: "see SEHN-chee", example: "Você se sente cansado?" },
          { form: "nos sentimos", meaning: "we feel", pron: "noosh sehn-CHEE-moosh", example: "Nós nos sentimos em casa no Rio." },
          { form: "se sentem", meaning: "you all feel", pron: "see SEHN-teng", example: "Vocês se sentem prontos pra prova?" },
        ],
      },
    },
    {
      pt: "se vestir", en: "to get dressed", irregular: true, tip: "'Vestir-se' = to get dressed. With clothes as the object there's no pronoun: visto a camisa. e→i verb: eu me VISTO, but você se VESTE.",
      tenses: {
        presente: [
          { form: "me visto", meaning: "I get dressed", pron: "mee VEESH-too", example: "Eu me visto rápido de manhã." },
          { form: "se veste", meaning: "you get dressed", pron: "see VESH-chee", example: "Você se veste bem demais!" },
          { form: "nos vestimos", meaning: "we get dressed", pron: "noosh vesh-CHEE-moosh", example: "Nós nos vestimos de branco no réveillon." },
          { form: "se vestem", meaning: "you all get dressed", pron: "see VESH-teng", example: "Vocês se vestem iguais de propósito?" },
        ],
      },
    },
    {
      pt: "se preocupar", en: "to worry", tip: "'Preocupar-se com' = to worry about: me preocupo com você. The comfort line is 'não se preocupa!' — don't worry.",
      tenses: {
        presente: [
          { form: "me preocupo", meaning: "I worry", pron: "mee preh-oh-KOO-poo", example: "Eu me preocupo com você." },
          { form: "se preocupa", meaning: "you worry", pron: "see preh-oh-KOO-pah", example: "Você se preocupa demais, relaxa." },
          { form: "nos preocupamos", meaning: "we worry", pron: "noosh preh-oh-koo-PAH-moosh", example: "Nós nos preocupamos com o futuro." },
          { form: "se preocupam", meaning: "you all worry", pron: "see preh-oh-KOO-pahng", example: "Vocês se preocupam à toa." },
        ],
      },
    },
    {
      pt: "se casar", en: "to get married", tip: "'Casar-se com' = to marry (someone). Spoken BR happily drops the pronoun — 'casei em 2020' and 'me casei em 2020' are both everyday.",
      tenses: {
        perfeito: [
          { form: "me casei", meaning: "I got married", pron: "mee kah-ZAY", example: "Eu me casei em 2020." },
          { form: "se casou", meaning: "you got married", pron: "see kah-ZOH", example: "Você se casou na igreja?" },
          { form: "nos casamos", meaning: "we got married", pron: "noosh kah-ZAH-moosh", example: "Nós nos casamos no civil." },
          { form: "se casaram", meaning: "you all got married", pron: "see kah-ZAH-rahng", example: "Vocês se casaram em segredo?" },
        ],
      },
    },
    {
      pt: "se divertir", en: "to have fun", tip: "'Divertir-se' = to have fun, enjoy yourself. 'Se divertiu?' is the standard morning-after question about any party.",
      tenses: {
        perfeito: [
          { form: "me diverti", meaning: "I had fun", pron: "mee djee-vehr-CHEE", example: "Eu me diverti muito na festa." },
          { form: "se divertiu", meaning: "you had fun", pron: "see djee-vehr-CHEE-oo", example: "Você se divertiu no show?" },
          { form: "nos divertimos", meaning: "we had fun", pron: "noosh djee-vehr-CHEE-moosh", example: "Nós nos divertimos demais no carnaval." },
          { form: "se divertiram", meaning: "you all had fun", pron: "see djee-vehr-CHEE-rahng", example: "Vocês se divertiram na viagem?" },
        ],
      },
    },
    {
      pt: "se machucar", en: "to get hurt", tip: "'Machucar-se' = to get hurt / hurt yourself. Without the pronoun it's transitive: machuquei o pé (I hurt my foot).",
      tenses: {
        perfeito: [
          { form: "me machuquei", meaning: "I got hurt", pron: "mee mah-shoo-KAY", example: "Eu me machuquei jogando futebol." },
          { form: "se machucou", meaning: "you got hurt", pron: "see mah-shoo-KOH", example: "Você se machucou? Tá tudo bem?" },
          { form: "nos machucamos", meaning: "we got hurt", pron: "noosh mah-shoo-KAH-moosh", example: "Nós nos machucamos na trilha." },
          { form: "se machucaram", meaning: "you all got hurt", pron: "see mah-shoo-KAH-rahng", example: "Vocês se machucaram no jogo?" },
        ],
      },
    },
    {
      pt: "se acostumar", en: "to get used to", tip: "'Acostumar-se com' = to get used to. 'Já me acostumei' = I'm used to it by now; the adjective is 'acostumado com'. In speech the infinitive keeps the pronoun in front: 'difícil se acostumar', never 'acostumar-se'.",
      tenses: {
        presente: [
          { form: "me acostumo", meaning: "I get used to", pron: "mee ah-kosh-TOO-moo", example: "Eu me acostumo rápido com lugar novo." },
          { form: "se acostuma", meaning: "you get used to", pron: "see ah-kosh-TOO-mah", example: "Você se acostuma com o barulho?" },
          { form: "nos acostumamos", meaning: "we get used to", pron: "noosh ah-kosh-too-MAH-moosh", example: "Nós nos acostumamos com o calor do Rio." },
          { form: "se acostumam", meaning: "you all get used to", pron: "see ah-kosh-TOO-mahng", example: "Vocês se acostumam com o horário novo?" },
        ],
        perfeito: [
          { form: "me acostumei", meaning: "I got used to", pron: "mee ah-kosh-too-MAY", example: "Eu me acostumei com o sotaque." },
          { form: "se acostumou", meaning: "you got used to", pron: "see ah-kosh-too-MOH", example: "Você se acostumou com a comida?" },
          { form: "nos acostumamos", meaning: "we got used to", pron: "noosh ah-kosh-too-MAH-moosh", example: "Nós nos acostumamos com a vida aqui." },
          { form: "se acostumaram", meaning: "you all got used to", pron: "see ah-kosh-too-MAH-rahng", example: "Vocês se acostumaram com o trânsito?" },
        ],
      },
    },
    {
      pt: "se adaptar", en: "to adapt (oneself)", tip: "'Adaptar-se a' in careful speech, 'se adaptar em/no' on the street: 'é difícil se adaptar no Brasil'. Plain 'adaptar' is to adapt something else: adaptei a receita.",
      tenses: {
        presente: [
          { form: "me adapto", meaning: "I adapt", pron: "mee ah-DAHP-too", example: "Eu me adapto a qualquer lugar." },
          { form: "se adapta", meaning: "you adapt", pron: "see ah-DAHP-tah", example: "Você se adapta fácil?" },
          { form: "nos adaptamos", meaning: "we adapt", pron: "noosh ah-dahp-TAH-moosh", example: "Nós nos adaptamos ao ritmo da cidade." },
          { form: "se adaptam", meaning: "you all adapt", pron: "see ah-DAHP-tahng", example: "Vocês se adaptam bem ao frio?" },
        ],
      },
    },
    {
      pt: "se mudar", en: "to move (house)", tip: "'Mudar-se' = to move house; plain 'mudar' = to change: 'eu me mudei pro Rio' vs 'eu mudei de trabalho'. Spoken BR also drops the pronoun ('mudei pro Rio') — both are everyday.",
      tenses: {
        perfeito: [
          { form: "me mudei", meaning: "I moved (house)", pron: "mee moo-DAY", example: "Eu me mudei pro Brasil em 2022." },
          { form: "se mudou", meaning: "you moved (house)", pron: "see moo-DOH", example: "Você se mudou pra Ipanema?" },
          { form: "nos mudamos", meaning: "we moved (house)", pron: "noosh moo-DAH-moosh", example: "Nós nos mudamos três vezes num ano." },
          { form: "se mudaram", meaning: "you all moved (house)", pron: "see moo-DAH-rahng", example: "Vocês se mudaram pro mesmo prédio?" },
        ],
      },
    },
    {
      pt: "se queixar", en: "to complain", tip: "'Queixar-se de' = to complain about. 'Reclamar de' is the everyday synonym without the pronoun; 'a queixa' is the complaint.",
      tenses: {
        presente: [
          { form: "me queixo", meaning: "I complain", pron: "mee KAY-shoo", example: "Eu me queixo do calor todo dia." },
          { form: "se queixa", meaning: "you complain", pron: "see KAY-shah", example: "Você se queixa de tudo!" },
          { form: "nos queixamos", meaning: "we complain", pron: "noosh kay-SHAH-moosh", example: "Nós nos queixamos do barulho pro síndico." },
          { form: "se queixam", meaning: "you all complain", pron: "see KAY-shahng", example: "Vocês se queixam do preço, mas voltam sempre." },
        ],
      },
    },
    {
      pt: "se arrumar", en: "to get ready", tip: "'Arrumar-se' = to get ready, to fix yourself up. Without the pronoun, 'arrumar' is to tidy or fix something: arrumo o quarto.",
      tenses: {
        presente: [
          { form: "me arrumo", meaning: "I get ready", pron: "mee ah-HOO-moo", example: "Eu me arrumo em dez minutos." },
          { form: "se arruma", meaning: "you get ready", pron: "see ah-HOO-mah", example: "Você se arruma pra sair à noite?" },
          { form: "nos arrumamos", meaning: "we get ready", pron: "noosh ah-hoo-MAH-moosh", example: "Nós nos arrumamos e saímos correndo." },
          { form: "se arrumam", meaning: "you all get ready", pron: "see ah-HOO-mahng", example: "Vocês se arrumam juntos antes da festa?" },
        ],
      },
    },
  ],

  // ── Everyday phrases ──────────────────────────────────────
  phrases: [
    { pt: "Se cuida!", en: "Take care!", alts: ["cuide-se"], pron: "see KWEE-dah", tip: "Rio's standard goodbye. Formal writing would demand 'Cuide-se', but on the street the pronoun comes first — pure spoken BR." },
    { pt: "Não se preocupa!", en: "Don't worry!", alts: ["não se preocupe"], pron: "nowng see preh-oh-KOO-pah", tip: "Textbook grammar wants 'não se preocupe' (subjunctive); relaxed carioca speech says 'não se preocupa'. Both accepted here." },
    { pt: "Se acalma!", en: "Calm down!", alts: ["acalme-se", "calma"], pron: "see ah-KOW-mah", tip: "Pronoun-first imperative, standard spoken BR. A bare 'Calma!' works too." },
    { pt: "A gente se vê!", en: "See you around!", alts: ["nos vemos"], pron: "ah ZHEHN-chee see VEH", tip: "Literally 'we see each other' — the everyday way to say goodbye to someone you'll bump into again. 'A gente' takes 'se'." },
    { pt: "A gente se fala!", en: "Talk to you later!", alts: ["nos falamos"], pron: "ah ZHEHN-chee see FAH-lah", tip: "Same pattern as 'a gente se vê' — reciprocal 'se' with 'a gente'. How phone calls and chats end all over Brazil." },
    { pt: "Como você se chama?", en: "What's your name?", alts: ["como se chama"], pron: "KOH-moo voh-SEH see SHAH-mah", tip: "'Qual é o seu nome?' is heard just as much, but 'como você se chama?' is the pronominal classic." },
    { pt: "Você se lembra de mim?", en: "Do you remember me?", alts: ["você lembra de mim", "se lembra de mim", "lembra de mim"], pron: "voh-SEH see LEHM-brah djee MEENG", tip: "'Lembrar-se de' — keep the 'de'. In casual speech the pronoun often drops ('você lembra de mim?'); both are natural." },
    { pt: "Eu me viro.", en: "I'll manage / I'll figure it out.", alts: ["me viro"], pron: "eh-oo mee VEE-roo", tip: "'Virar-se' = to get by, to sort yourself out. Pure Rio attitude: 'relaxa, eu me viro'." },
    { pt: "Eles se casaram ano passado.", en: "They got married last year.", alts: ["eles casaram ano passado", "se casaram ano passado"], pron: "EH-leesh see kah-ZAH-rahng", tip: "'Casar(-se)' works with or without the pronoun in spoken BR — 'casaram' and 'se casaram' are both everyday." },
    { pt: "Eu me acostumei com o calor.", en: "I got used to the heat.", alts: ["me acostumei com o calor"], pron: "mee ah-kosh-too-MAY", tip: "'Acostumar-se com' = to get used to. 'Já me acostumei' = I'm used to it by now." },
    { pt: "Te ligo amanhã!", en: "I'll call you tomorrow!", alts: ["ligo pra você amanhã"], pron: "chee LEE-goo ah-mah-NYANG", tip: "Here is 'te': the everyday object pronoun for 'você' in Brazil. Starting a sentence with it ('Te ligo…') is exactly what European Portuguese never does — and what Brazilians do all day." },
    { pt: "Se comporta!", en: "Behave yourself!", alts: ["comporte-se"], pron: "see kom-POHR-tah", tip: "'Comportar-se' = to behave. Pronoun-first imperative — what every carioca mother says at the door." },
    { pt: "Me avisa quando chegar.", en: "Let me know when you arrive.", alts: ["me avise quando chegar", "me avisa quando você chegar", "me avise quando você chegar"], pron: "mee ah-VEE-zah KWAHN-doo sheh-GAHR", tip: "Object pronoun first, then the verb: 'me avisa', 'me liga', 'me manda'. The textbook imperative would be 'me avise'; Rio says 'me avisa'." },
    { pt: "Te aviso depois.", en: "I'll let you know later.", alts: ["eu te aviso depois", "aviso você depois"], pron: "chee ah-VEE-zoo deh-POYSH", tip: "The pair of 'me avisa': you → 'te'. 'Te aviso', 'te ligo', 'te falo depois' — the present tense doing future duty, as usual in speech." },
    { pt: "Me empresta uma camiseta?", en: "Can you lend me a T-shirt?", alts: ["me empreste uma camiseta", "você me empresta uma camiseta"], pron: "mee ehm-PREHSH-tah OO-mah kah-mee-ZEH-tah", tip: "Requests are just the present tense with 'me' in front: 'me empresta?', 'me passa o sal?', 'me dá um minuto?'. The answer: 'tá, te empresto a preta'." },
    { pt: "Me devolve depois.", en: "Give it back to me later.", alts: ["me devolva depois", "devolve pra mim depois"], pron: "mee deh-VOW-vee deh-POYSH", tip: "'Devolver' = to give back. 'Me devolve' (spoken) or 'me devolva' (textbook imperative) — both accepted." },
    { pt: "Não me importo.", en: "I don't mind.", alts: ["eu não me importo", "não ligo"], pron: "nowng mee eem-POHR-too", tip: "'Importar-se com' = to mind, to care about. 'Não ligo' and 'tô nem aí' say the same with less and less politeness." },
    { pt: "Isso me incomoda.", en: "That bothers me.", pron: "EE-soo mee een-koh-MOH-dah", tip: "Here 'me' is the object, not a reflexive: the thing bothers ME. Same shape: 'me surpreende' (surprises me), 'não me convence' (doesn't convince me)." },
    { pt: "Eu me identifico com isso.", en: "I relate to that.", alts: ["me identifico com isso"], pron: "eh-oo mee ee-dehn-chee-FEE-koo kong EE-soo", tip: "'Identificar-se com' = to relate to, to see yourself in. The classic reaction to a song, a film, a story." },
    { pt: "Só me dei conta depois.", en: "I only realized afterwards.", alts: ["eu só me dei conta depois", "só percebi depois"], pron: "saw mee DAY KOHN-tah deh-POYSH", tip: "'Se dar conta (de)' = to realize; past of dar: dei. One of the 'conta' family: dar conta de (to manage), tomar conta de (to look after), levar em conta (to take into account)." },
  ],
};
