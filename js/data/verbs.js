// 146 verbs: a 124-verb superset — this repo's own 105 verbs merged with the 95 from the
// source flashcards repo credited in the README (76 overlap). Forms for every verb were
// cross-validated: the generated conjugations agree with their hand-written forms on
// all 285 verb/tense pairs. Pronunciation hints and examples for the 29 study-only
// verbs were authored to match their Rio-register conventions. `acontecer` (to happen)
// was added on top with only its third-person rows drilled, then 21 high-frequency
// spoken verbs (tomar, olhar, acabar, existir, morrer, nascer, receber, mandar, brincar,
// almoçar, jantar, avisar, descobrir, ensinar, gastar, buscar, visitar, virar, arrumar,
// aproveitar, desligar) — each placed in its category block.
window.DATA_VERBS = {
  categories: [
    { name: "Essenciais", color: "#ec4899" },
    { name: "Modais e cognitivos", color: "#0ea5e9" },
    { name: "Vida diária e mobilidade", color: "#3b82f6" },
    { name: "Comunicação", color: "#8b5cf6" },
    { name: "Consumo e serviços", color: "#10b981" },
    { name: "Rotina e lazer", color: "#f59e0b" },
    { name: "Ações do dia a dia", color: "#f97316" },
    { name: "Ações e movimentos", color: "#14b8a6" },
    { name: "Sentimentos e percepção", color: "#a855f7" },
    { name: "Interação social", color: "#ef4444" },
  ],
  persons: ["eu", "você / ele / ela", "nós", "vocês / eles / elas"],
  personsShort: ["eu", "você", "nós", "vocês"],
  tenses: [
    { key: "presente",   label: "Presente" },
    { key: "perfeito",   label: "Pretérito Perfeito" },
    { key: "imperfeito", label: "Pretérito Imperfeito" },
    // Optional per verb: a curated 40-verb subset carries the imperfect subjunctive.
    { key: "subjuntivo", label: "Imperfeito do Subjuntivo" },
  ],
  synonyms: [
    ["botar", "colocar", "pôr"],
    ["andar", "caminhar"],
  ],
  verbs: [
    {
      pt: "ser", en: "to be (permanent / inherent)", category: "Essenciais", irregular: true,
      tenses: {
        presente: [
          { form: "sou", meaning: "I am (permanent)", pron: "SOH", example: "Eu sou brasileiro." },
          { form: "é", meaning: "you are (permanent)", pron: "EH", example: "Você é inteligente." },
          { form: "somos", meaning: "we are (permanent)", pron: "SOH-moosh", example: "Nós somos amigos." },
          { form: "são", meaning: "you all are (permanent)", pron: "SOWng", example: "Vocês são muito gentis." },
        ],
        perfeito: [
          { form: "fui", meaning: "I was (permanent)", pron: "FOO-ee", example: "Eu fui aluno dessa escola." },
          { form: "foi", meaning: "you were (permanent)", pron: "FOH-ee", example: "Você foi o primeiro a chegar?" },
          { form: "fomos", meaning: "we were (permanent)", pron: "FOH-moosh", example: "Nós fomos colegas de trabalho." },
          { form: "foram", meaning: "you all were (permanent)", pron: "FOH-rahng", example: "Vocês foram alunos dela?" },
        ],
        imperfeito: [
          { form: "era", meaning: "I was / used to be (permanent)", pron: "EH-rah", example: "Eu era muito tímido quando era criança." },
          { form: "era", meaning: "you were / used to be (permanent)", pron: "EH-rah", example: "Você era assim antes também?" },
          { form: "éramos", meaning: "we were / used to be (permanent)", pron: "EH-rah-moosh", example: "Nós éramos vizinhos na infância." },
          { form: "eram", meaning: "you all were / used to be (permanent)", pron: "EH-rahng", example: "Vocês eram amigos no colégio?" },
        ],
        subjuntivo: [
          { form: "fosse", meaning: "if I were (permanent)", pron: "FOH-see", example: "Se eu fosse rico, morava de frente pra praia." },
          { form: "fosse", meaning: "if you were (permanent)", pron: "FOH-see", example: "Queria que você fosse mais paciente comigo." },
          { form: "fôssemos", meaning: "if we were (permanent)", pron: "FOH-seh-moosh", example: "Ele fala como se nós fôssemos crianças." },
          { form: "fossem", meaning: "if you all were (permanent)", pron: "FOH-seng", example: "Era melhor que vocês fossem honestos com ela." },
        ],
      },
    },
    {
      pt: "estar", en: "to be (temporary / location)", category: "Essenciais", irregular: true,
      tenses: {
        presente: [
          { form: "estou", meaning: "I am (temporary)", pron: "ish-TOH", example: "Eu estou bem." },
          { form: "está", meaning: "you are (temporary)", pron: "ish-TAH", example: "Você está cansado?" },
          { form: "estamos", meaning: "we are (temporary)", pron: "ish-TAH-moosh", example: "Nós estamos em casa." },
          { form: "estão", meaning: "you all are (temporary)", pron: "ish-TOWng", example: "Vocês estão prontos?" },
        ],
        perfeito: [
          { form: "estive", meaning: "I was (temporary)", pron: "es-CHEE-vee", example: "Eu estive em casa o dia todo." },
          { form: "esteve", meaning: "you were (temporary)", pron: "es-TEH-vee", example: "Você esteve no escritório de manhã?" },
          { form: "estivemos", meaning: "we were (temporary)", pron: "es-chee-VEH-moosh", example: "Nós estivemos lá no fim de semana." },
          { form: "estiveram", meaning: "you all were (temporary)", pron: "es-chee-VEH-rahng", example: "Vocês estiveram com a Maria ontem?" },
        ],
        imperfeito: [
          { form: "estava", meaning: "I used to be / was (temporary)", pron: "es-TAH-vah", example: "Eu estava em casa quando você ligou." },
          { form: "estava", meaning: "you used to be / were (temporary)", pron: "es-TAH-vah", example: "Você estava sempre cansado na escola?" },
          { form: "estávamos", meaning: "we used to be / were (temporary)", pron: "es-TAH-vah-moosh", example: "Nós estávamos na praia todo verão." },
          { form: "estavam", meaning: "you all used to be / were (temporary)", pron: "es-TAH-vahng", example: "Vocês estavam juntos naquela época?" },
        ],
        subjuntivo: [
          { form: "estivesse", meaning: "if I were (temporary)", pron: "es-chee-VEH-see", example: "Se eu estivesse aí, te ajudava com isso." },
          { form: "estivesse", meaning: "if you were (temporary)", pron: "es-chee-VEH-see", example: "Gostaria que você estivesse na minha festa ontem." },
          { form: "estivéssemos", meaning: "if we were (temporary)", pron: "es-chee-VEH-seh-moosh", example: "Era melhor que nós estivéssemos prontos às oito." },
          { form: "estivessem", meaning: "if you all were (temporary)", pron: "es-chee-VEH-seng", example: "Ela agiu como se vocês estivessem errados." },
        ],
      },
    },
    {
      pt: "ter", en: "to have", category: "Essenciais", irregular: true,
      tenses: {
        presente: [
          { form: "tenho", meaning: "I have", pron: "TEN-yoo", example: "Eu tenho fome." },
          { form: "tem", meaning: "you have", pron: "TAYNG", example: "Você tem tempo?" },
          { form: "temos", meaning: "we have", pron: "TEH-moosh", example: "Nós temos aula." },
          { form: "têm", meaning: "you all have", pron: "TAYNG", example: "Vocês têm uma reserva?" },
        ],
        perfeito: [
          { form: "tive", meaning: "I had", pron: "TEE-vee", example: "Eu tive uma ideia no banho." },
          { form: "teve", meaning: "you had", pron: "TEH-vee", example: "Você teve tempo para almoçar?" },
          { form: "tivemos", meaning: "we had", pron: "tee-VEH-moosh", example: "Nós tivemos sorte com o tempo." },
          { form: "tiveram", meaning: "you all had", pron: "tee-VEH-rahng", example: "Vocês tiveram aula ontem?" },
        ],
        imperfeito: [
          { form: "tinha", meaning: "I had / used to have", pron: "CHEE-nyah", example: "Eu tinha um cachorro quando era pequeno." },
          { form: "tinha", meaning: "you had / used to have", pron: "CHEE-nyah", example: "Você tinha bicicleta quando era criança?" },
          { form: "tínhamos", meaning: "we had / used to have", pron: "CHEE-nyah-moosh", example: "Nós tínhamos uma casa na praia." },
          { form: "tinham", meaning: "you all had / used to have", pron: "CHEE-nyahng", example: "Vocês tinham aula aos sábados?" },
        ],
        subjuntivo: [
          { form: "tivesse", meaning: "if I had", pron: "chee-VEH-see", example: "Se eu tivesse dinheiro, comprava um carro novo." },
          { form: "tivesse", meaning: "if you had", pron: "chee-VEH-see", example: "Queria que você tivesse mais tempo pra mim." },
          { form: "tivéssemos", meaning: "if we had", pron: "chee-VEH-seh-moosh", example: "Se nós tivéssemos carro, a gente viajava mais." },
          { form: "tivessem", meaning: "if you all had", pron: "chee-VEH-seng", example: "Ele falou como se vocês tivessem culpa de tudo." },
        ],
      },
    },
    {
      pt: "haver", en: "there to be / to exist", category: "Essenciais", irregular: true, quiz: false,
      tenses: {
        presente: [
          { form: "hei", meaning: "I have (archaic; survives only in \"hei de\")", pron: "", example: "" },
          { form: "há", meaning: "there is / are", pron: "", example: "" },
          { form: "havemos", meaning: "we have (archaic)", pron: "", example: "" },
          { form: "hão", meaning: "they have (archaic)", pron: "", example: "" },
        ],
        perfeito: [
          { form: "houve", meaning: "I had (rare)", pron: "", example: "" },
          { form: "houve", meaning: "there was / were", pron: "", example: "" },
          { form: "houvemos", meaning: "we had (rare)", pron: "", example: "" },
          { form: "houveram", meaning: "they had (rare)", pron: "", example: "" },
        ],
        imperfeito: [
          { form: "havia", meaning: "I used to have (rare)", pron: "", example: "" },
          { form: "havia", meaning: "there was / were", pron: "", example: "" },
          { form: "havíamos", meaning: "we used to have (rare)", pron: "", example: "" },
          { form: "haviam", meaning: "they used to have (rare)", pron: "", example: "" },
        ],
      },
    },
    {
      pt: "ir", en: "to go", category: "Essenciais", irregular: true,
      tenses: {
        presente: [
          { form: "vou", meaning: "I go", pron: "VOH", example: "Eu vou ao mercado." },
          { form: "vai", meaning: "you go", pron: "VY", example: "Você vai ao trabalho?" },
          { form: "vamos", meaning: "we go / let's go", pron: "VAH-moosh", example: "Nós vamos à praia." },
          { form: "vão", meaning: "you all go", pron: "VOWng", example: "Vocês vão de carro?" },
        ],
        perfeito: [
          { form: "fui", meaning: "I went", pron: "FOO-ee", example: "Eu fui para a praia ontem." },
          { form: "foi", meaning: "you went", pron: "FOH-ee", example: "Você foi sozinho?" },
          { form: "fomos", meaning: "we went", pron: "FOH-moosh", example: "Nós fomos de metrô hoje cedo." },
          { form: "foram", meaning: "you all went", pron: "FOH-rahng", example: "Vocês foram ao supermercado ontem?" },
        ],
        imperfeito: [
          { form: "ia", meaning: "I used to go / was going", pron: "EE-ah", example: "Eu ia à escola de bicicleta." },
          { form: "ia", meaning: "you used to go / were going", pron: "EE-ah", example: "Você ia muito ao cinema?" },
          { form: "íamos", meaning: "we used to go / were going", pron: "EE-ah-moosh", example: "Nós íamos na padaria todo dia." },
          { form: "iam", meaning: "you all used to go / were going", pron: "EE-ahng", example: "Vocês iam à praia nos fins de semana?" },
        ],
        subjuntivo: [
          { form: "fosse", meaning: "if I went", pron: "FOH-see", example: "Se eu fosse de carro, chegava bem mais rápido." },
          { form: "fosse", meaning: "if you went", pron: "FOH-see", example: "Queria que você fosse comigo ao médico amanhã." },
          { form: "fôssemos", meaning: "if we went", pron: "FOH-seh-moosh", example: "Era melhor que nós fôssemos de ônibus pro centro." },
          { form: "fossem", meaning: "if you all went", pron: "FOH-seng", example: "Se vocês fossem à festa, iam se divertir muito." },
        ],
      },
    },
    {
      pt: "vir", en: "to come", category: "Essenciais", irregular: true,
      tenses: {
        presente: [
          { form: "venho", meaning: "I come", pron: "VEN-yoo", example: "Eu venho de São Paulo." },
          { form: "vem", meaning: "you come", pron: "VAYNG", example: "Você vem comigo?" },
          { form: "vimos", meaning: "we come", pron: "VEE-moosh", example: "Nós vimos aqui toda semana." },
          { form: "vêm", meaning: "you all come", pron: "VAYNG", example: "Vocês vêm amanhã?" },
        ],
        perfeito: [
          { form: "vim", meaning: "I came", pron: "VEENG", example: "Eu vim de metrô hoje." },
          { form: "veio", meaning: "you came", pron: "VAY-oo", example: "Você veio sozinho?" },
          { form: "viemos", meaning: "we came", pron: "vee-EH-moosh", example: "Nós viemos cedo para evitar trânsito." },
          { form: "vieram", meaning: "you all came", pron: "vee-EH-rahng", example: "Vocês vieram ontem à noite?" },
        ],
        imperfeito: [
          { form: "vinha", meaning: "I used to come / was coming", pron: "VEE-nyah", example: "Eu vinha aqui todo domingo." },
          { form: "vinha", meaning: "you used to come / were coming", pron: "VEE-nyah", example: "Você vinha de ônibus antes?" },
          { form: "vínhamos", meaning: "we used to come / were coming", pron: "VEE-nyah-moosh", example: "Nós vínhamos juntos para a aula." },
          { form: "vinham", meaning: "you all used to come / were coming", pron: "VEE-nyahng", example: "Vocês vinham sempre nesse horário?" },
        ],
        subjuntivo: [
          { form: "viesse", meaning: "if I came", pron: "vee-EH-see", example: "Ela queria que eu viesse mais cedo pra casa." },
          { form: "viesse", meaning: "if you came", pron: "vee-EH-see", example: "Se você viesse aqui hoje, a gente conversava melhor." },
          { form: "viéssemos", meaning: "if we came", pron: "vee-EH-seh-moosh", example: "Era melhor que nós viéssemos de metrô, né?" },
          { form: "viessem", meaning: "if you all came", pron: "vee-EH-seng", example: "Gostaria que vocês viessem jantar aqui em casa." },
        ],
      },
    },
    {
      pt: "fazer", en: "to do, to make", category: "Essenciais", irregular: true,
      tenses: {
        presente: [
          { form: "faço", meaning: "I do / make", pron: "FAH-soo", example: "Eu faço o jantar." },
          { form: "faz", meaning: "you do / make", pron: "FAHSH", example: "Você faz exercício?" },
          { form: "fazemos", meaning: "we do / make", pron: "fah-ZEH-moosh", example: "Nós fazemos café em casa." },
          { form: "fazem", meaning: "you all do / make", pron: "FAH-zeng", example: "Vocês fazem isso todo dia?" },
        ],
        perfeito: [
          { form: "fiz", meaning: "I did / made", pron: "FEES", example: "Eu fiz o jantar ontem." },
          { form: "fez", meaning: "you did / made", pron: "FEHS", example: "Você fez exercício hoje cedo?" },
          { form: "fizemos", meaning: "we did / made", pron: "fee-ZEH-moosh", example: "Nós fizemos café em casa." },
          { form: "fizeram", meaning: "you all did / made", pron: "fee-ZEH-rahng", example: "Vocês fizeram a reserva ontem?" },
        ],
        imperfeito: [
          { form: "fazia", meaning: "I used to do / make / was doing", pron: "fah-ZEE-ah", example: "Eu fazia bolo com a minha mãe todo domingo." },
          { form: "fazia", meaning: "you used to do / make / were doing", pron: "fah-ZEE-ah", example: "Você fazia esporte quando era jovem?" },
          { form: "fazíamos", meaning: "we used to do / make / were doing", pron: "fah-ZEE-ah-moosh", example: "Nós fazíamos festa no quintal." },
          { form: "faziam", meaning: "you all used to do / make / were doing", pron: "fah-ZEE-ahng", example: "Vocês faziam dever de casa à tarde?" },
        ],
        subjuntivo: [
          { form: "fizesse", meaning: "if I did / made", pron: "fee-ZEH-see", example: "Se eu fizesse dieta, perdia uns quilos rapidinho." },
          { form: "fizesse", meaning: "if you did / made", pron: "fee-ZEH-see", example: "Queria que você fizesse o jantar hoje." },
          { form: "fizéssemos", meaning: "if we did / made", pron: "fee-ZEH-seh-moosh", example: "Era melhor que nós fizéssemos isso juntos." },
          { form: "fizessem", meaning: "if you all did / made", pron: "fee-ZEH-seng", example: "Ela agiu como se vocês fizessem tudo errado." },
        ],
      },
    },
    {
      pt: "dar", en: "to give", category: "Essenciais", irregular: true,
      tenses: {
        presente: [
          { form: "dou", meaning: "I give", pron: "DOH", example: "Eu dou um presente." },
          { form: "dá", meaning: "you give", pron: "DAH", example: "Você dá gorjeta?" },
          { form: "damos", meaning: "we give", pron: "DAH-moosh", example: "Nós damos aula de inglês." },
          { form: "dão", meaning: "you all give", pron: "DOWng", example: "Vocês dão conta?" },
        ],
        perfeito: [
          { form: "dei", meaning: "I gave", pron: "DAY", example: "Eu dei um presente para ela." },
          { form: "deu", meaning: "you gave", pron: "DEH-oo", example: "Você deu comida ao cachorro?" },
          { form: "demos", meaning: "we gave", pron: "DEH-moosh", example: "Nós demos risada o tempo todo." },
          { form: "deram", meaning: "you all gave", pron: "DEH-rahng", example: "Vocês deram uma resposta final?" },
        ],
        imperfeito: [
          { form: "dava", meaning: "I used to give / was giving", pron: "DAH-vah", example: "Eu dava comida para o gato todo dia." },
          { form: "dava", meaning: "you used to give / were giving", pron: "DAH-vah", example: "Você dava presente no aniversário dela?" },
          { form: "dávamos", meaning: "we used to give / were giving", pron: "DAH-vah-moosh", example: "Nós dávamos aula de reforço no sábado." },
          { form: "davam", meaning: "you all used to give / were giving", pron: "DAH-vahng", example: "Vocês davam café da manhã cedo?" },
        ],
        subjuntivo: [
          { form: "desse", meaning: "if I gave", pron: "DEH-see", example: "Se eu desse mais atenção, ela ficava feliz." },
          { form: "desse", meaning: "if you gave", pron: "DEH-see", example: "Queria que você desse uma olhada nisso pra mim." },
          { form: "déssemos", meaning: "if we gave", pron: "DEH-seh-moosh", example: "Era melhor que nós déssemos o presente juntos." },
          { form: "dessem", meaning: "if you all gave", pron: "DEH-seng", example: "Ele saiu antes que vocês dessem tchau." },
        ],
      },
    },
    {
      pt: "ver", en: "to see", category: "Essenciais", irregular: true,
      tenses: {
        presente: [
          { form: "vejo", meaning: "I see", pron: "VEH-zhoo", example: "Eu vejo um táxi." },
          { form: "vê", meaning: "you see", pron: "VEH", example: "Você vê a montanha?" },
          { form: "vemos", meaning: "we see", pron: "VEH-moosh", example: "Nós vemos tudo daqui." },
          { form: "veem", meaning: "you all see", pron: "VEH-eng", example: "Vocês veem aquele prédio?" },
        ],
        perfeito: [
          { form: "vi", meaning: "I saw", pron: "VEE", example: "Eu vi a Ana no mercado." },
          { form: "viu", meaning: "you saw", pron: "VEE-oo", example: "Você viu aquele filme já?" },
          { form: "vimos", meaning: "we saw", pron: "VEE-moosh", example: "Nós vimos o show da janela." },
          { form: "viram", meaning: "you all saw", pron: "VEE-rahng", example: "Vocês viram a mensagem dela?" },
        ],
        imperfeito: [
          { form: "via", meaning: "I used to see / was seeing", pron: "VEE-ah", example: "Eu via meus primos todo fim de semana." },
          { form: "via", meaning: "you used to see / were seeing", pron: "VEE-ah", example: "Você via muitos filmes quando era criança?" },
          { form: "víamos", meaning: "we used to see / were seeing", pron: "VEE-ah-moosh", example: "Nós víamos o pôr do sol da varanda." },
          { form: "viam", meaning: "you all used to see / were seeing", pron: "VEE-ahng", example: "Vocês viam aquele programa na Globo?" },
        ],
        subjuntivo: [
          { form: "visse", meaning: "if I saw", pron: "VEE-see", example: "Se eu visse ele na rua, nem cumprimentava." },
          { form: "visse", meaning: "if you saw", pron: "VEE-see", example: "Queria que você visse o pôr do sol daqui." },
          { form: "víssemos", meaning: "if we saw", pron: "VEE-seh-moosh", example: "Ela escondeu tudo antes que nós víssemos a bagunça." },
          { form: "vissem", meaning: "if you all saw", pron: "VEE-seng", example: "Era melhor que vocês vissem o filme no cinema." },
        ],
      },
    },
    {
      pt: "ficar", en: "to stay, to become", category: "Essenciais",
      tenses: {
        presente: [
          { form: "fico", meaning: "I stay / become", pron: "FEE-koo", example: "Eu fico em casa hoje." },
          { form: "fica", meaning: "you stay / become", pron: "FEE-kah", example: "Você fica aqui comigo?" },
          { form: "ficamos", meaning: "we stay / become", pron: "fee-KAH-moosh", example: "Nós ficamos até o fim." },
          { form: "ficam", meaning: "you all stay / become", pron: "FEE-kahng", example: "Vocês ficam para o jantar?" },
        ],
        perfeito: [
          { form: "fiquei", meaning: "I stayed / became", pron: "fee-KAY", example: "Eu fiquei em casa ontem à noite." },
          { form: "ficou", meaning: "you stayed / became", pron: "fee-KOH", example: "Você ficou cansado depois da viagem?" },
          { form: "ficamos", meaning: "we stayed / became", pron: "fee-KAH-moosh", example: "Nós ficamos lá até tarde." },
          { form: "ficaram", meaning: "you all stayed / became", pron: "fee-KAH-rahng", example: "Vocês ficaram felizes com a notícia?" },
        ],
        imperfeito: [
          { form: "ficava", meaning: "I used to stay / remain / was staying", pron: "fee-KAH-vah", example: "Eu ficava em casa nas férias." },
          { form: "ficava", meaning: "you used to stay / remain / were staying", pron: "fee-KAH-vah", example: "Você ficava até tarde na festa?" },
          { form: "ficávamos", meaning: "we used to stay / remain / were staying", pron: "fee-KAH-vah-moosh", example: "Nós ficávamos no parque até o anoitecer." },
          { form: "ficavam", meaning: "you all used to stay / remain / were staying", pron: "fee-KAH-vahng", example: "Vocês ficavam com os avós no verão?" },
        ],
        subjuntivo: [
          { form: "ficasse", meaning: "if I stayed / became", pron: "fee-KAH-see", example: "Ela queria que eu ficasse mais um pouco na festa." },
          { form: "ficasse", meaning: "if you stayed / became", pron: "fee-KAH-see", example: "Se você ficasse em casa, a gente pedia pizza." },
          { form: "ficássemos", meaning: "if we stayed / became", pron: "fee-KAH-seh-moosh", example: "Era melhor que nós ficássemos quietos na reunião." },
          { form: "ficassem", meaning: "if you all stayed / became", pron: "fee-KAH-seng", example: "Saí antes que vocês ficassem bravos comigo." },
        ],
      },
    },
    {
      // Verbs of happening have no real "I" or "we". Those rows stay Browse-only
      // (row-level quiz: false) and the drilled rows name their own subject
      // (person) instead of the default você / vocês.
      pt: "acontecer", en: "to happen", category: "Essenciais",
      tenses: {
        presente: [
          { form: "aconteço", meaning: "I happen (never used)", pron: "ah-kon-TEH-soo", example: "", quiz: false },
          { form: "acontece", meaning: "it happens", pron: "ah-kon-TEH-see", example: "Isso acontece muito no Rio.", person: "isso" },
          { form: "acontecemos", meaning: "we happen (never used)", pron: "ah-kon-teh-SEH-moosh", example: "", quiz: false },
          { form: "acontecem", meaning: "things happen", pron: "ah-kon-TEH-seng", example: "As coisas acontecem, relaxa.", person: "as coisas" },
        ],
        perfeito: [
          { form: "aconteci", meaning: "I happened (never used)", pron: "ah-kon-teh-SEE", example: "", quiz: false },
          { form: "aconteceu", meaning: "it happened", pron: "ah-kon-teh-SEH-oo", example: "O que aconteceu com você?", person: "isso" },
          { form: "acontecemos", meaning: "we happened (never used)", pron: "ah-kon-teh-SEH-moosh", example: "", quiz: false },
          { form: "aconteceram", meaning: "things happened", pron: "ah-kon-teh-SEH-rahng", example: "Muitas coisas aconteceram esse ano.", person: "as coisas" },
        ],
        imperfeito: [
          { form: "acontecia", meaning: "I used to happen (never used)", pron: "ah-kon-teh-SEE-ah", example: "", quiz: false },
          { form: "acontecia", meaning: "it used to happen", pron: "ah-kon-teh-SEE-ah", example: "Isso acontecia direto quando eu era criança.", person: "isso" },
          { form: "acontecíamos", meaning: "we used to happen (never used)", pron: "ah-kon-teh-SEE-ah-moosh", example: "", quiz: false },
          { form: "aconteciam", meaning: "things used to happen", pron: "ah-kon-teh-SEE-ahng", example: "Antigamente as coisas aconteciam mais devagar.", person: "as coisas" },
        ],
      },
    },
    {
      // Like acontecer: "eu existo" is a joke line, not a sentence. Third person only.
      pt: "existir", en: "to exist", category: "Essenciais",
      tenses: {
        presente: [
          { form: "existo", meaning: "I exist (rare)", pron: "eh-ZEESH-too", example: "", quiz: false },
          { form: "existe", meaning: "it exists", pron: "eh-ZEESH-chee", example: "Isso ainda existe?", person: "isso" },
          { form: "existimos", meaning: "we exist (rare)", pron: "eh-zeesh-CHEE-moosh", example: "", quiz: false },
          { form: "existem", meaning: "they exist", pron: "eh-ZEESH-teng", example: "Eles existem, sim, eu já vi.", person: "eles" },
        ],
        perfeito: [
          { form: "existi", meaning: "I existed (rare)", pron: "eh-zeesh-CHEE", example: "", quiz: false },
          { form: "existiu", meaning: "it existed", pron: "eh-zeesh-CHEE-oo", example: "Isso existiu mesmo ou é lenda?", person: "isso" },
          { form: "existimos", meaning: "we existed (rare)", pron: "eh-zeesh-CHEE-moosh", example: "", quiz: false },
          { form: "existiram", meaning: "they existed", pron: "eh-zeesh-CHEE-rahng", example: "Eles existiram de verdade, não é ficção.", person: "eles" },
        ],
        imperfeito: [
          { form: "existia", meaning: "I used to exist (rare)", pron: "eh-zeesh-CHEE-ah", example: "", quiz: false },
          { form: "existia", meaning: "it used to exist", pron: "eh-zeesh-CHEE-ah", example: "Isso não existia na minha época.", person: "isso" },
          { form: "existíamos", meaning: "we used to exist (rare)", pron: "eh-zeesh-CHEE-ah-moosh", example: "", quiz: false },
          { form: "existiam", meaning: "they used to exist", pron: "eh-zeesh-CHEE-ahng", example: "Naquela época eles nem existiam.", person: "eles" },
        ],
      },
    },
    {
      pt: "poder", en: "can, to be able to", category: "Modais e cognitivos", irregular: true,
      tenses: {
        presente: [
          { form: "posso", meaning: "I can", pron: "POH-soo", example: "Eu posso ajudar." },
          { form: "pode", meaning: "you can", pron: "POH-djee", example: "Você pode falar devagar?" },
          { form: "podemos", meaning: "we can", pron: "poh-DEH-moosh", example: "Nós podemos tentar de novo." },
          { form: "podem", meaning: "you all can", pron: "POH-deng", example: "Vocês podem entrar agora." },
        ],
        perfeito: [
          { form: "pude", meaning: "I could / was able to", pron: "POO-djee", example: "Eu pude descansar no feriado." },
          { form: "pôde", meaning: "you could / were able to", pron: "POH-djee", example: "Você pôde falar com ela ontem?" },
          { form: "pudemos", meaning: "we could / were able to", pron: "poo-DEH-moosh", example: "Nós pudemos entrar mais cedo." },
          { form: "puderam", meaning: "you all could / were able to", pron: "poo-DEH-rahng", example: "Vocês puderam resolver o problema?" },
        ],
        imperfeito: [
          { form: "podia", meaning: "I used to be able to / could", pron: "poh-DJEE-ah", example: "Eu podia sair até tarde no sábado." },
          { form: "podia", meaning: "you used to be able to / could", pron: "poh-DJEE-ah", example: "Você podia dormir até tarde nas férias?" },
          { form: "podíamos", meaning: "we used to be able to / could", pron: "poh-DJEE-ah-moosh", example: "Nós podíamos nadar na piscina do prédio." },
          { form: "podiam", meaning: "you all used to be able to / could", pron: "poh-DJEE-ahng", example: "Vocês podiam brincar na rua?" },
        ],
        subjuntivo: [
          { form: "pudesse", meaning: "if I could", pron: "poo-DEH-see", example: "Se eu pudesse, viajava o mundo inteiro." },
          { form: "pudesse", meaning: "if you could", pron: "poo-DEH-see", example: "Queria que você pudesse vir na festa amanhã." },
          { form: "pudéssemos", meaning: "if we could", pron: "poo-DEH-seh-moosh", example: "Seria ótimo se nós pudéssemos sair mais cedo hoje." },
          { form: "pudessem", meaning: "if you all could", pron: "poo-DEH-seng", example: "Ele falou como se vocês pudessem adivinhar tudo." },
        ],
      },
    },
    {
      pt: "querer", en: "to want", category: "Modais e cognitivos", irregular: true,
      tenses: {
        presente: [
          { form: "quero", meaning: "I want", pron: "KEH-roo", example: "Eu quero água." },
          { form: "quer", meaning: "you want", pron: "KEHR", example: "Você quer café?" },
          { form: "queremos", meaning: "we want", pron: "keh-REH-moosh", example: "Nós queremos aprender mais." },
          { form: "querem", meaning: "you all want", pron: "KEH-reng", example: "Vocês querem sobremesa?" },
        ],
        perfeito: [
          { form: "quis", meaning: "I wanted", pron: "KEES", example: "Eu quis comprar aquele livro." },
          { form: "quis", meaning: "you wanted", pron: "KEES", example: "Você quis sair mais cedo?" },
          { form: "quisemos", meaning: "we wanted", pron: "kee-ZEH-moosh", example: "Nós quisemos ajudar você." },
          { form: "quiseram", meaning: "you all wanted", pron: "kee-ZEH-rahng", example: "Vocês quiseram mudar a data?" },
        ],
        imperfeito: [
          { form: "queria", meaning: "I used to want", pron: "keh-REE-ah", example: "Eu queria ser médico quando era criança." },
          { form: "queria", meaning: "you used to want", pron: "keh-REE-ah", example: "Você queria um cachorro?" },
          { form: "queríamos", meaning: "we used to want", pron: "keh-REE-ah-moosh", example: "Nós queríamos viajar todo ano." },
          { form: "queriam", meaning: "you all used to want", pron: "keh-REE-ahng", example: "Vocês queriam morar em outro bairro?" },
        ],
        subjuntivo: [
          { form: "quisesse", meaning: "if I wanted", pron: "kee-ZEH-see", example: "Se eu quisesse sair hoje, chamava você." },
          { form: "quisesse", meaning: "if you wanted", pron: "kee-ZEH-see", example: "Você me olhou como se quisesse dizer algo." },
          { form: "quiséssemos", meaning: "if we wanted", pron: "kee-ZEH-seh-moosh", example: "Se nós quiséssemos, podíamos viajar amanhã mesmo." },
          { form: "quisessem", meaning: "if you all wanted", pron: "kee-ZEH-seng", example: "Queria que vocês quisessem participar da festa." },
        ],
      },
    },
    {
      pt: "precisar", en: "to need", category: "Modais e cognitivos",
      tenses: {
        presente: [
          { form: "preciso", meaning: "I need", pron: "preh-SEE-zoo", example: "Eu preciso de ajuda." },
          { form: "precisa", meaning: "you need", pron: "preh-SEE-zah", example: "Você precisa sair agora?" },
          { form: "precisamos", meaning: "we need", pron: "preh-see-ZAH-moosh", example: "Nós precisamos comprar comida." },
          { form: "precisam", meaning: "you all need", pron: "preh-SEE-zahng", example: "Vocês precisam de mais tempo?" },
        ],
        perfeito: [
          { form: "precisei", meaning: "I needed", pron: "preh-see-ZAY", example: "Eu precisei sair cedo ontem." },
          { form: "precisou", meaning: "you needed", pron: "preh-see-ZOH", example: "Você precisou de ajuda?" },
          { form: "precisamos", meaning: "we needed", pron: "preh-see-ZAH-moosh", example: "Nós precisamos comprar mais água ontem." },
          { form: "precisaram", meaning: "you all needed", pron: "preh-see-ZAH-rahng", example: "Vocês precisaram ligar para ela?" },
        ],
        imperfeito: [
          { form: "precisava", meaning: "I used to need", pron: "preh-see-ZAH-vah", example: "Eu precisava de ajuda com a lição." },
          { form: "precisava", meaning: "you used to need", pron: "preh-see-ZAH-vah", example: "Você precisava acordar cedo?" },
          { form: "precisávamos", meaning: "we used to need", pron: "preh-see-ZAH-vah-moosh", example: "Nós precisávamos estudar para a prova." },
          { form: "precisavam", meaning: "you all used to need", pron: "preh-see-ZAH-vahng", example: "Vocês precisavam de mais tempo?" },
        ],
        subjuntivo: [
          { form: "precisasse", meaning: "if I needed", pron: "preh-see-ZAH-see", example: "Se eu precisasse de ajuda, te ligava na hora." },
          { form: "precisasse", meaning: "if you needed", pron: "preh-see-ZAH-see", example: "Ele agia como se você precisasse de babá." },
          { form: "precisássemos", meaning: "if we needed", pron: "preh-see-ZAH-seh-moosh", example: "Se nós precisássemos de grana, pedíamos pro tio." },
          { form: "precisassem", meaning: "if you all needed", pron: "preh-see-ZAH-seng", example: "Resolvi tudo antes que vocês precisassem se preocupar." },
        ],
      },
    },
    {
      pt: "dever", en: "must, should", category: "Modais e cognitivos",
      tenses: {
        presente: [
          { form: "devo", meaning: "I must / owe", pron: "DEH-voo", example: "Eu devo uma resposta pra ele." },
          { form: "deve", meaning: "you must / should", pron: "DEH-vee", example: "Você deve ligar mais cedo." },
          { form: "devemos", meaning: "we must / should", pron: "deh-VEH-moosh", example: "Nós devemos tomar uma decisão." },
          { form: "devem", meaning: "you all must / should", pron: "DEH-veng", example: "Vocês devem chegar antes das dez?" },
        ],
        perfeito: [
          { form: "devi", meaning: "I owed", pron: "deh-VEE", example: "Eu devi dinheiro ao banco por um tempo, mas paguei tudo." },
          { form: "deveu", meaning: "you owed", pron: "deh-VAY-oo", example: "Você já deveu dinheiro a um amigo?" },
          { form: "devemos", meaning: "we owed", pron: "deh-VEH-moosh", example: "Nós devemos dinheiro ao banco por anos, mas quitamos tudo." },
          { form: "deveram", meaning: "you all owed", pron: "deh-VEH-rahng", example: "Vocês já deveram dinheiro a alguém?" },
        ],
        imperfeito: [
          { form: "devia", meaning: "I used to owe / should / was supposed to", pron: "deh-VEE-ah", example: "Eu devia ligar antes de aparecer." },
          { form: "devia", meaning: "you used to owe / should / were supposed to", pron: "deh-VEE-ah", example: "Você devia estudar mais nessa época?" },
          { form: "devíamos", meaning: "we used to owe / should / were supposed to", pron: "deh-VEE-ah-moosh", example: "Nós devíamos prestar mais atenção a isso." },
          { form: "deviam", meaning: "you all used to owe / should", pron: "deh-VEE-ahng", example: "Vocês deviam chegar mais cedo?" },
        ],
        subjuntivo: [
          { form: "devesse", meaning: "if I had to / owed", pron: "deh-VEH-see", example: "Ele me cobra como se eu devesse milhões." },
          { form: "devesse", meaning: "if you had to / owed", pron: "deh-VEH-see", example: "Se você devesse dinheiro, o banco já tinha ligado." },
          { form: "devêssemos", meaning: "if we had to / owed", pron: "deh-VEH-seh-moosh", example: "Seria bom se nós devêssemos menos no cartão." },
          { form: "devessem", meaning: "if you all had to / owed", pron: "deh-VEH-seng", example: "Paguei a conta antes que vocês devessem juros." },
        ],
      },
    },
    {
      pt: "saber", en: "to know (facts)", category: "Modais e cognitivos", irregular: true,
      tenses: {
        presente: [
          { form: "sei", meaning: "I know (a fact)", pron: "SAY", example: "Eu sei a resposta." },
          { form: "sabe", meaning: "you know (a fact)", pron: "SAH-bee", example: "Você sabe onde fica?" },
          { form: "sabemos", meaning: "we know (a fact)", pron: "sah-BEH-moosh", example: "Nós sabemos a verdade." },
          { form: "sabem", meaning: "you all know (a fact)", pron: "SAH-beng", example: "Vocês sabem a resposta?" },
        ],
        perfeito: [
          { form: "soube", meaning: "I found out / knew (a fact)", pron: "SOH-bee", example: "Eu soube da notícia ontem." },
          { form: "soube", meaning: "you found out / knew (a fact)", pron: "SOH-bee", example: "Você soube do cancelamento?" },
          { form: "soubemos", meaning: "we found out / knew (a fact)", pron: "soh-BEH-moosh", example: "Nós soubemos tarde demais." },
          { form: "souberam", meaning: "you all found out / knew (a fact)", pron: "soh-BEH-rahng", example: "Vocês souberam pelo grupo?" },
        ],
        imperfeito: [
          { form: "sabia", meaning: "I used to know (a fact)", pron: "sah-BEE-ah", example: "Eu sabia o endereço de cor." },
          { form: "sabia", meaning: "you used to know (a fact)", pron: "sah-BEE-ah", example: "Você sabia o nome de todos os vizinhos?" },
          { form: "sabíamos", meaning: "we used to know (a fact)", pron: "sah-BEE-ah-moosh", example: "Nós sabíamos a resposta sempre." },
          { form: "sabiam", meaning: "you all used to know (a fact)", pron: "sah-BEE-ahng", example: "Vocês sabiam que ele morava perto?" },
        ],
        subjuntivo: [
          { form: "soubesse", meaning: "if I knew (a fact)", pron: "soh-BEH-see", example: "Se eu soubesse disso antes, tinha te avisado." },
          { form: "soubesse", meaning: "if you knew (a fact)", pron: "soh-BEH-see", example: "Saí de fininho antes que você soubesse da surpresa." },
          { form: "soubéssemos", meaning: "if we knew (a fact)", pron: "soh-BEH-seh-moosh", example: "Era melhor que nós soubéssemos a verdade logo." },
          { form: "soubessem", meaning: "if you all knew (a fact)", pron: "soh-BEH-seng", example: "Queria que vocês soubessem o quanto sou grato." },
        ],
      },
    },
    {
      pt: "conhecer", en: "to know (people, places)", category: "Modais e cognitivos",
      tenses: {
        presente: [
          { form: "conheço", meaning: "I know (a person/place)", pron: "koh-NYEH-soo", example: "Eu conheço esse lugar." },
          { form: "conhece", meaning: "you know (a person/place)", pron: "koh-NYEH-see", example: "Você conhece a Ana?" },
          { form: "conhecemos", meaning: "we know (a person/place)", pron: "koh-nyeh-SEH-moosh", example: "Nós conhecemos bem a cidade." },
          { form: "conhecem", meaning: "you all know (a person/place)", pron: "koh-NYEH-seng", example: "Vocês conhecem esse restaurante?" },
        ],
        perfeito: [
          { form: "conheci", meaning: "I met / got to know (a person/place)", pron: "koh-nyeh-SEE", example: "Eu conheci ela na festa ontem." },
          { form: "conheceu", meaning: "you met / got to know (a person/place)", pron: "koh-nyeh-SEH-oo", example: "Você conheceu o Pedro no trabalho?" },
          { form: "conhecemos", meaning: "we met / got to know (a person/place)", pron: "koh-nyeh-SEH-moosh", example: "Nós conhecemos o bairro no ano passado." },
          { form: "conheceram", meaning: "you all met / got to know (a person/place)", pron: "koh-nyeh-SEH-rahng", example: "Vocês conheceram a família dela?" },
        ],
        imperfeito: [
          { form: "conhecia", meaning: "I used to know / was acquainted with (a person/place)", pron: "koh-nyeh-SEE-ah", example: "Eu conhecia todo mundo no bairro." },
          { form: "conhecia", meaning: "you used to know / were acquainted with (a person/place)", pron: "koh-nyeh-SEE-ah", example: "Você conhecia a família dele?" },
          { form: "conhecíamos", meaning: "we used to know / were acquainted with (a person/place)", pron: "koh-nyeh-SEE-ah-moosh", example: "Nós conhecíamos aquele lugar desde criança." },
          { form: "conheciam", meaning: "you all used to know / were acquainted with (a person/place)", pron: "koh-nyeh-SEE-ahng", example: "Vocês conheciam a professora antes?" },
        ],
        subjuntivo: [
          { form: "conhecesse", meaning: "if I knew (a person/place)", pron: "koh-nyeh-SEH-see", example: "Ela falava como se eu conhecesse todo mundo ali." },
          { form: "conhecesse", meaning: "if you knew (a person/place)", pron: "koh-nyeh-SEH-see", example: "Queria que você conhecesse minha família no Natal." },
          { form: "conhecêssemos", meaning: "if we knew (a person/place)", pron: "koh-nyeh-SEH-seh-moosh", example: "Se nós conhecêssemos o caminho, chegávamos mais rápido." },
          { form: "conhecessem", meaning: "if you all knew (a person/place)", pron: "koh-nyeh-SEH-seng", example: "Era melhor que vocês conhecessem a cidade antes de mudar." },
        ],
      },
    },
    {
      pt: "achar", en: "to think, to find", category: "Modais e cognitivos",
      tenses: {
        presente: [
          { form: "acho", meaning: "I think / find (reckon)", pron: "AH-shoo", example: "Eu acho que sim." },
          { form: "acha", meaning: "you think / find (reckon)", pron: "AH-shah", example: "Você acha isso normal?" },
          { form: "achamos", meaning: "we think / find (reckon)", pron: "ah-SHAH-moosh", example: "Nós achamos a ideia boa." },
          { form: "acham", meaning: "you all think / find (reckon)", pron: "AH-shahng", example: "Vocês acham esse lugar bonito?" },
        ],
        perfeito: [
          { form: "achei", meaning: "I thought / found (reckon)", pron: "ah-SHAY", example: "Eu achei o livro na estante." },
          { form: "achou", meaning: "you thought / found (reckon)", pron: "ah-SHOH", example: "Você achou estranho?" },
          { form: "achamos", meaning: "we thought / found (reckon)", pron: "ah-SHAH-moosh", example: "Nós achamos um lugar legal." },
          { form: "acharam", meaning: "you all thought / found (reckon)", pron: "ah-SHAH-rahng", example: "Vocês acharam a resposta?" },
        ],
        imperfeito: [
          { form: "achava", meaning: "I used to think / find (reckon)", pron: "ah-SHAH-vah", example: "Eu achava aquele filme muito engraçado." },
          { form: "achava", meaning: "you used to think / find (reckon)", pron: "ah-SHAH-vah", example: "Você achava que ia chover?" },
          { form: "achávamos", meaning: "we used to think / find (reckon)", pron: "ah-SHAH-vah-moosh", example: "Nós achávamos o lugar bonito." },
          { form: "achavam", meaning: "you all used to think / find (reckon)", pron: "ah-SHAH-vahng", example: "Vocês achavam difícil aprender inglês?" },
        ],
        subjuntivo: [
          { form: "achasse", meaning: "if I thought (reckon)", pron: "ah-SHAH-see", example: "Se eu achasse a ideia boa, falava logo." },
          { form: "achasse", meaning: "if you thought (reckon)", pron: "ah-SHAH-see", example: "Queria que você achasse graça nas minhas piadas." },
          { form: "achássemos", meaning: "if we thought (reckon)", pron: "ah-SHAH-seh-moosh", example: "Ela agiu como se nós achássemos tudo normal." },
          { form: "achassem", meaning: "if you all thought (reckon)", pron: "ah-SHAH-seng", example: "Ele falou como se vocês achassem tudo muito fácil." },
        ],
      },
    },
    {
      pt: "pensar", en: "to think", category: "Modais e cognitivos",
      tenses: {
        presente: [
          { form: "penso", meaning: "I think (reflect)", pron: "PEN-soo", example: "Eu penso bem antes de responder." },
          { form: "pensa", meaning: "you think (reflect)", pron: "PEN-sah", example: "Você pensa que é uma boa ideia?" },
          { form: "pensamos", meaning: "we think (reflect)", pron: "pen-SAH-moosh", example: "Nós pensamos em viajar no carnaval." },
          { form: "pensam", meaning: "you all think (reflect)", pron: "PEN-sahng", example: "Vocês pensam igual sobre isso?" },
        ],
        perfeito: [
          { form: "pensei", meaning: "I thought (reflect)", pron: "pen-SAY", example: "Eu pensei bem antes de decidir." },
          { form: "pensou", meaning: "you thought (reflect)", pron: "pen-SOH", example: "Você pensou na proposta?" },
          { form: "pensamos", meaning: "we thought (reflect)", pron: "pen-SAH-moosh", example: "Nós pensamos em mudar o plano." },
          { form: "pensaram", meaning: "you all thought (reflect)", pron: "pen-SAH-rahng", example: "Vocês pensaram no custo?" },
        ],
        imperfeito: [
          { form: "pensava", meaning: "I used to think / was thinking (reflect)", pron: "pen-SAH-vah", example: "Eu pensava em você o tempo todo." },
          { form: "pensava", meaning: "you used to think / were thinking (reflect)", pron: "pen-SAH-vah", example: "Você pensava em desistir às vezes?" },
          { form: "pensávamos", meaning: "we used to think / were thinking (reflect)", pron: "pen-SAH-vah-moosh", example: "Nós pensávamos em nos mudar." },
          { form: "pensavam", meaning: "you all used to think (reflect)", pron: "pen-SAH-vahng", example: "Vocês pensavam muito antes de decidir?" },
        ],
        subjuntivo: [
          { form: "pensasse", meaning: "if I thought (reflect)", pron: "pen-SAH-see", example: "Se eu pensasse demais, não fazia nada." },
          { form: "pensasse", meaning: "if you thought (reflect)", pron: "pen-SAH-see", example: "Era melhor que você pensasse antes de falar." },
          { form: "pensássemos", meaning: "if we thought (reflect)", pron: "pen-SAH-seh-moosh", example: "Queria que nós pensássemos juntos numa solução." },
          { form: "pensassem", meaning: "if you all thought (reflect)", pron: "pen-SAH-seng", example: "Ele falou como se vocês pensassem igual a ele." },
        ],
      },
    },
    {
      pt: "lembrar", en: "to remember", category: "Modais e cognitivos",
      tenses: {
        presente: [
          { form: "lembro", meaning: "I remember", pron: "LEM-broo", example: "Eu lembro do endereço." },
          { form: "lembra", meaning: "you remember", pron: "LEM-brah", example: "Você lembra do nome dele?" },
          { form: "lembramos", meaning: "we remember", pron: "lem-BRAH-moosh", example: "Nós lembramos de tudo que aconteceu." },
          { form: "lembram", meaning: "you all remember", pron: "LEM-brahng", example: "Vocês lembram do dia que se conheceram?" },
        ],
        perfeito: [
          { form: "lembrei", meaning: "I remembered", pron: "lem-BRAY", example: "Eu lembrei do aniversário dela." },
          { form: "lembrou", meaning: "you remembered", pron: "lem-BROH", example: "Você lembrou de trazer o documento?" },
          { form: "lembramos", meaning: "we remembered", pron: "lem-BRAH-moosh", example: "Nós lembramos de fechar o gás." },
          { form: "lembraram", meaning: "you all remembered", pron: "lem-BRAH-rahng", example: "Vocês lembraram de confirmar a reserva?" },
        ],
        imperfeito: [
          { form: "lembrava", meaning: "I used to remember / was remembering", pron: "lem-BRAH-vah", example: "Eu lembrava de tudo que ela dizia." },
          { form: "lembrava", meaning: "you used to remember / were remembering", pron: "lem-BRAH-vah", example: "Você lembrava o nome dos colegas?" },
          { form: "lembrávamos", meaning: "we used to remember / were remembering", pron: "lem-BRAH-vah-moosh", example: "Nós lembrávamos as receitas de cor." },
          { form: "lembravam", meaning: "you all used to remember", pron: "lem-BRAH-vahng", example: "Vocês lembravam das histórias antigas?" },
        ],
        subjuntivo: [
          { form: "lembrasse", meaning: "if I remembered", pron: "lem-BRAH-see", example: "Se eu lembrasse do código, abria a porta." },
          { form: "lembrasse", meaning: "if you remembered", pron: "lem-BRAH-see", example: "Queria que você lembrasse do nosso aniversário." },
          { form: "lembrássemos", meaning: "if we remembered", pron: "lem-BRAH-seh-moosh", example: "Era melhor que nós lembrássemos disso mais cedo." },
          { form: "lembrassem", meaning: "if you all remembered", pron: "lem-BRAH-seng", example: "Ele perguntou como se vocês lembrassem de tudo." },
        ],
      },
    },
    {
      pt: "esquecer", en: "to forget", category: "Modais e cognitivos",
      tenses: {
        presente: [
          { form: "esqueço", meaning: "I forget", pron: "esh-KEH-soo", example: "Eu esqueço o guarda-chuva sempre." },
          { form: "esquece", meaning: "you forget", pron: "esh-KEH-see", example: "Você esquece onde deixou?" },
          { form: "esquecemos", meaning: "we forget", pron: "esh-keh-SEH-moosh", example: "Nós esquecemos de reservar mesa." },
          { form: "esquecem", meaning: "you all forget", pron: "esh-KEH-seng", example: "Vocês esquecem de avisar?" },
        ],
        perfeito: [
          { form: "esqueci", meaning: "I forgot", pron: "ess-keh-SEE", example: "Eu esqueci o guarda-chuva no ônibus." },
          { form: "esqueceu", meaning: "you forgot", pron: "ess-keh-SAY-oo", example: "Você esqueceu a senha de novo?" },
          { form: "esquecemos", meaning: "we forgot", pron: "ess-keh-SEH-moosh", example: "Nós esquecemos de levar o carregador." },
          { form: "esqueceram", meaning: "you all forgot", pron: "ess-keh-SEH-rahng", example: "Vocês esqueceram o horário da reunião?" },
        ],
        imperfeito: [
          { form: "esquecia", meaning: "I used to forget / was forgetting", pron: "es-keh-SEE-ah", example: "Eu esquecia o guarda-chuva sempre." },
          { form: "esquecia", meaning: "you used to forget / were forgetting", pron: "es-keh-SEE-ah", example: "Você esquecia o nome das pessoas?" },
          { form: "esquecíamos", meaning: "we used to forget / were forgetting", pron: "es-keh-SEE-ah-moosh", example: "Nós esquecíamos de confirmar a reserva." },
          { form: "esqueciam", meaning: "you all used to forget", pron: "es-keh-SEE-ahng", example: "Vocês esqueciam as tarefas com frequência?" },
        ],
      },
    },
    {
      pt: "decidir", en: "to decide", category: "Modais e cognitivos",
      tenses: {
        presente: [
          { form: "decido", meaning: "I decide", pron: "deh-SEE-doo", example: "Eu decido depois." },
          { form: "decide", meaning: "you decide", pron: "deh-SEE-djee", example: "Você decide o que comer?" },
          { form: "decidimos", meaning: "we decide", pron: "deh-see-DJEE-moosh", example: "Nós decidimos juntos." },
          { form: "decidem", meaning: "you all decide", pron: "deh-SEE-deng", example: "Vocês decidem aonde ir?" },
        ],
        perfeito: [
          { form: "decidi", meaning: "I decided", pron: "deh-see-DJEE", example: "Eu decidi ficar em casa." },
          { form: "decidiu", meaning: "you decided", pron: "deh-see-DJEE-oo", example: "Você decidiu isso ontem?" },
          { form: "decidimos", meaning: "we decided", pron: "deh-see-DJEE-moosh", example: "Nós decidimos viajar em julho." },
          { form: "decidiram", meaning: "you all decided", pron: "deh-see-DJEE-rahng", example: "Vocês decidiram juntos?" },
        ],
        imperfeito: [
          { form: "decidia", meaning: "I used to decide / would decide", pron: "deh-see-DJEE-ah", example: "Eu sempre decidia o que pedir antes de chegar." },
          { form: "decidia", meaning: "you used to decide / would decide", pron: "deh-see-DJEE-ah", example: "Você decidia tudo sozinho?" },
          { form: "decidíamos", meaning: "we used to decide / would decide", pron: "deh-see-DJEE-ah-moosh", example: "Nós decidíamos juntos onde almoçar." },
          { form: "decidiam", meaning: "you all used to decide / would decide", pron: "deh-see-DJEE-ahng", example: "Vocês decidiam rápido ou demorava?" },
        ],
      },
    },
    {
      pt: "depender", en: "to depend", category: "Modais e cognitivos",
      tenses: {
        presente: [
          { form: "dependo", meaning: "I depend", pron: "deh-PEN-doo", example: "Eu dependo do ônibus pra trabalhar." },
          { form: "depende", meaning: "you depend", pron: "deh-PEN-dee", example: "Você depende do tempo que faz?" },
          { form: "dependemos", meaning: "we depend", pron: "deh-pen-DEH-moosh", example: "Nós dependemos da wifi aqui." },
          { form: "dependem", meaning: "you all depend", pron: "deh-PEN-deng", example: "Vocês dependem do carro pra tudo?" },
        ],
        perfeito: [
          { form: "dependi", meaning: "I depended", pron: "deh-pen-DJEE", example: "Eu dependi muito dos colegas no início." },
          { form: "dependeu", meaning: "you depended", pron: "deh-pen-DAY-oo", example: "Você dependeu dessa decisão?" },
          { form: "dependemos", meaning: "we depended", pron: "deh-pen-DEH-moosh", example: "Nós dependemos do ônibus para chegar." },
          { form: "dependeram", meaning: "you all depended", pron: "deh-pen-DEH-rahng", example: "Vocês dependeram de mim o tempo todo?" },
        ],
        imperfeito: [
          { form: "dependia", meaning: "I used to depend / was depending", pron: "deh-pen-DJEE-ah", example: "Eu dependia muito da família." },
          { form: "dependia", meaning: "you used to depend / were depending", pron: "deh-pen-DJEE-ah", example: "Você dependia do ônibus para trabalhar?" },
          { form: "dependíamos", meaning: "we used to depend / were depending", pron: "deh-pen-DJEE-ah-moosh", example: "Nós dependíamos do clima para sair." },
          { form: "dependiam", meaning: "you all used to depend", pron: "deh-pen-DJEE-ahng", example: "Vocês dependiam uns dos outros?" },
        ],
      },
    },
    {
      pt: "resolver", en: "to solve, to sort out", category: "Modais e cognitivos",
      tenses: {
        presente: [
          { form: "resolvo", meaning: "I solve", pron: "heh-ZOHL-voo", example: "Eu resolvo esse problema agora." },
          { form: "resolve", meaning: "you solve", pron: "heh-ZOHL-vee", example: "Você resolve essa questão com ele?" },
          { form: "resolvemos", meaning: "we solve", pron: "heh-zohl-VEH-moosh", example: "Nós resolvemos tudo entre nós." },
          { form: "resolvem", meaning: "you all solve", pron: "heh-ZOHL-veng", example: "Vocês resolvem isso hoje?" },
        ],
        perfeito: [
          { form: "resolvi", meaning: "I solved / resolved", pron: "heh-zohl-VEE", example: "Eu resolvi o problema rapidamente." },
          { form: "resolveu", meaning: "you solved / resolved", pron: "heh-zohl-VAY-oo", example: "Você resolveu a questão com o banco?" },
          { form: "resolvemos", meaning: "we solved / resolved", pron: "heh-zohl-VEH-moosh", example: "Nós resolvemos tudo antes de sair." },
          { form: "resolveram", meaning: "you all solved / resolved", pron: "heh-zohl-VEH-rahng", example: "Vocês resolveram a situação?" },
        ],
        imperfeito: [
          { form: "resolvia", meaning: "I used to solve / resolve / was solving", pron: "heh-zohl-VEE-ah", example: "Eu resolvia os problemas sozinha." },
          { form: "resolvia", meaning: "you used to solve / resolve / were solving", pron: "heh-zohl-VEE-ah", example: "Você resolvia tudo na base da conversa?" },
          { form: "resolvíamos", meaning: "we used to solve / resolve / were solving", pron: "heh-zohl-VEE-ah-moosh", example: "Nós resolvíamos as questões em grupo." },
          { form: "resolviam", meaning: "you all used to solve / resolve", pron: "heh-zohl-VEE-ahng", example: "Vocês resolviam os conflitos com calma?" },
        ],
      },
    },
    {
      pt: "descobrir", en: "to find out, to discover", category: "Modais e cognitivos", irregular: true,
      tenses: {
        presente: [
          { form: "descubro", meaning: "I find out", pron: "desh-KOO-broo", example: "Eu descubro tudo pelo Instagram." },
          { form: "descobre", meaning: "you find out", pron: "desh-KOH-bree", example: "Você sempre descobre a fofoca primeiro." },
          { form: "descobrimos", meaning: "we find out", pron: "desh-koh-BREE-moosh", example: "Nós descobrimos um boteco ótimo ali." },
          { form: "descobrem", meaning: "you all find out", pron: "desh-KOH-breng", example: "Vocês descobrem tudo rápido, hein?" },
        ],
        perfeito: [
          { form: "descobri", meaning: "I found out", pron: "desh-koh-BREE", example: "Eu descobri um atalho pra praia." },
          { form: "descobriu", meaning: "you found out", pron: "desh-koh-BREE-oo", example: "Você descobriu quem foi?" },
          { form: "descobrimos", meaning: "we found out", pron: "desh-koh-BREE-moosh", example: "Nós descobrimos a verdade ontem." },
          { form: "descobriram", meaning: "you all found out", pron: "desh-koh-BREE-rahng", example: "Vocês descobriram o resultado?" },
        ],
        imperfeito: [
          { form: "descobria", meaning: "I used to find out", pron: "desh-koh-BREE-ah", example: "Eu sempre descobria a surpresa antes." },
          { form: "descobria", meaning: "you used to find out", pron: "desh-koh-BREE-ah", example: "Você descobria tudo pela sua irmã?" },
          { form: "descobríamos", meaning: "we used to find out", pron: "desh-koh-BREE-ah-moosh", example: "Nós descobríamos lugares novos toda semana." },
          { form: "descobriam", meaning: "you all used to find out", pron: "desh-koh-BREE-ahng", example: "Vocês descobriam as notas antes dos pais?" },
        ],
      },
    },
    {
      pt: "morar", en: "to live (reside)", category: "Vida diária e mobilidade",
      tenses: {
        presente: [
          { form: "moro", meaning: "I live (reside)", pron: "MOH-roo", example: "Eu moro no Rio." },
          { form: "mora", meaning: "you live (reside)", pron: "MOH-rah", example: "Você mora perto daqui?" },
          { form: "moramos", meaning: "we live (reside)", pron: "moh-RAH-moosh", example: "Nós moramos no centro." },
          { form: "moram", meaning: "you all live (reside)", pron: "MOH-rahng", example: "Vocês moram no Brasil?" },
        ],
        perfeito: [
          { form: "morei", meaning: "I lived (reside)", pron: "moh-RAY", example: "Eu morei em Lisboa por um ano." },
          { form: "morou", meaning: "you lived (reside)", pron: "moh-ROH", example: "Você morou no Rio quando era criança?" },
          { form: "moramos", meaning: "we lived (reside)", pron: "moh-RAH-moosh", example: "Nós moramos perto da praia naquele verão." },
          { form: "moraram", meaning: "you all lived (reside)", pron: "moh-RAH-rahng", example: "Vocês moraram aqui antes?" },
        ],
        imperfeito: [
          { form: "morava", meaning: "I used to live / was living (reside)", pron: "moh-RAH-vah", example: "Eu morava perto da escola." },
          { form: "morava", meaning: "you used to live / were living (reside)", pron: "moh-RAH-vah", example: "Você morava com os seus avós?" },
          { form: "morávamos", meaning: "we used to live / were living (reside)", pron: "moh-RAH-vah-moosh", example: "Nós morávamos em Copacabana naquela época." },
          { form: "moravam", meaning: "you all used to live / were living (reside)", pron: "moh-RAH-vahng", example: "Vocês moravam no mesmo prédio?" },
        ],
        subjuntivo: [
          { form: "morasse", meaning: "if I lived (reside)", pron: "moh-RAH-see", example: "Se eu morasse na praia, nadava todo dia." },
          { form: "morasse", meaning: "if you lived (reside)", pron: "moh-RAH-see", example: "Queria que você morasse mais perto da gente." },
          { form: "morássemos", meaning: "if we lived (reside)", pron: "moh-RAH-seh-moosh", example: "Ele fala como se nós morássemos num palácio." },
          { form: "morassem", meaning: "if you all lived (reside)", pron: "moh-RAH-seng", example: "Era melhor que vocês morassem juntos pra dividir o aluguel." },
        ],
      },
    },
    {
      pt: "trabalhar", en: "to work", category: "Vida diária e mobilidade",
      tenses: {
        presente: [
          { form: "trabalho", meaning: "I work", pron: "trah-BAH-lyoo", example: "Eu trabalho muito." },
          { form: "trabalha", meaning: "you work", pron: "trah-BAH-lyah", example: "Você trabalha aqui?" },
          { form: "trabalhamos", meaning: "we work", pron: "trah-bah-LYAH-moosh", example: "Nós trabalhamos juntos." },
          { form: "trabalham", meaning: "you all work", pron: "trah-BAH-lyahng", example: "Vocês trabalham aos sábados?" },
        ],
        perfeito: [
          { form: "trabalhei", meaning: "I worked", pron: "trah-bah-LYAY", example: "Eu trabalhei até tarde ontem." },
          { form: "trabalhou", meaning: "you worked", pron: "trah-bah-LYOH", example: "Você trabalhou no sábado?" },
          { form: "trabalhamos", meaning: "we worked", pron: "trah-bah-LYAH-moosh", example: "Nós trabalhamos juntos no projeto." },
          { form: "trabalharam", meaning: "you all worked", pron: "trah-bah-LYAH-rahng", example: "Vocês trabalharam de casa ontem?" },
        ],
        imperfeito: [
          { form: "trabalhava", meaning: "I used to work / was working", pron: "trah-bah-LYAH-vah", example: "Eu trabalhava com o meu pai no sábado." },
          { form: "trabalhava", meaning: "you used to work / were working", pron: "trah-bah-LYAH-vah", example: "Você trabalhava depois da escola?" },
          { form: "trabalhávamos", meaning: "we used to work / were working", pron: "trah-bah-LYAH-vah-moosh", example: "Nós trabalhávamos juntos no verão." },
          { form: "trabalhavam", meaning: "you all used to work / were working", pron: "trah-bah-LYAH-vahng", example: "Vocês trabalhavam numa loja naquele bairro?" },
        ],
        subjuntivo: [
          { form: "trabalhasse", meaning: "if I worked", pron: "trah-bah-LYAH-see", example: "Meu chefe queria que eu trabalhasse no feriado." },
          { form: "trabalhasse", meaning: "if you worked", pron: "trah-bah-LYAH-see", example: "Se você trabalhasse menos, tinha mais tempo pra família." },
          { form: "trabalhássemos", meaning: "if we worked", pron: "trah-bah-LYAH-seh-moosh", example: "Era melhor que nós trabalhássemos juntos nesse projeto." },
          { form: "trabalhassem", meaning: "if you all worked", pron: "trah-bah-LYAH-seng", example: "Ele age como se vocês trabalhassem só pra ele." },
        ],
      },
    },
    {
      pt: "estudar", en: "to study", category: "Vida diária e mobilidade",
      tenses: {
        presente: [
          { form: "estudo", meaning: "I study", pron: "esh-TOO-doo", example: "Eu estudo português toda noite." },
          { form: "estuda", meaning: "you study", pron: "esh-TOO-dah", example: "Você estuda onde?" },
          { form: "estudamos", meaning: "we study", pron: "esh-too-DAH-moosh", example: "Nós estudamos juntos na biblioteca." },
          { form: "estudam", meaning: "you all study", pron: "esh-TOO-dahng", example: "Vocês estudam pra prova amanhã?" },
        ],
        perfeito: [
          { form: "estudei", meaning: "I studied", pron: "ess-too-DAY", example: "Eu estudei para a prova ontem à noite." },
          { form: "estudou", meaning: "you studied", pron: "ess-too-DOH", example: "Você estudou com alguém?" },
          { form: "estudamos", meaning: "we studied", pron: "ess-too-DAH-moosh", example: "Nós estudamos na biblioteca." },
          { form: "estudaram", meaning: "you all studied", pron: "ess-too-DAH-rahng", example: "Vocês estudaram o capítulo todo?" },
        ],
        imperfeito: [
          { form: "estudava", meaning: "I used to study / was studying", pron: "es-too-DAH-vah", example: "Eu estudava português todos os dias." },
          { form: "estudava", meaning: "you used to study / were studying", pron: "es-too-DAH-vah", example: "Você estudava muito antes das provas?" },
          { form: "estudávamos", meaning: "we used to study / were studying", pron: "es-too-DAH-vah-moosh", example: "Nós estudávamos juntos na biblioteca." },
          { form: "estudavam", meaning: "you all used to study", pron: "es-too-DAH-vahng", example: "Vocês estudavam à noite?" },
        ],
        subjuntivo: [
          { form: "estudasse", meaning: "if I studied", pron: "es-too-DAH-see", example: "Se eu estudasse mais, passava fácil nessa prova." },
          { form: "estudasse", meaning: "if you studied", pron: "es-too-DAH-see", example: "Sua mãe queria que você estudasse medicina, né?" },
          { form: "estudássemos", meaning: "if we studied", pron: "es-too-DAH-seh-moosh", example: "A professora pediu que nós estudássemos o capítulo dois." },
          { form: "estudassem", meaning: "if you all studied", pron: "es-too-DAH-seng", example: "Gostaria que vocês estudassem antes de sair pra rua." },
        ],
      },
    },
    {
      pt: "chegar", en: "to arrive", category: "Vida diária e mobilidade",
      tenses: {
        presente: [
          { form: "chego", meaning: "I arrive", pron: "SHEH-goo", example: "Eu chego às oito." },
          { form: "chega", meaning: "you arrive", pron: "SHEH-gah", example: "Você chega cedo ao trabalho?" },
          { form: "chegamos", meaning: "we arrive", pron: "sheh-GAH-moosh", example: "Nós chegamos amanhã de manhã." },
          { form: "chegam", meaning: "you all arrive", pron: "SHEH-gahng", example: "Vocês chegam juntos?" },
        ],
        perfeito: [
          { form: "cheguei", meaning: "I arrived", pron: "sheh-GAY", example: "Eu cheguei tarde ontem." },
          { form: "chegou", meaning: "you arrived", pron: "sheh-GOH", example: "Você chegou cedo ao aeroporto?" },
          { form: "chegamos", meaning: "we arrived", pron: "sheh-GAH-moosh", example: "Nós chegamos em casa depois da meia-noite." },
          { form: "chegaram", meaning: "you all arrived", pron: "sheh-GAH-rahng", example: "Vocês chegaram juntos ontem?" },
        ],
        imperfeito: [
          { form: "chegava", meaning: "I used to arrive / was arriving", pron: "sheh-GAH-vah", example: "Eu chegava em casa às seis." },
          { form: "chegava", meaning: "you used to arrive / were arriving", pron: "sheh-GAH-vah", example: "Você chegava sempre atrasado?" },
          { form: "chegávamos", meaning: "we used to arrive / were arriving", pron: "sheh-GAH-vah-moosh", example: "Nós chegávamos cedo no trabalho." },
          { form: "chegavam", meaning: "you all used to arrive / were arriving", pron: "sheh-GAH-vahng", example: "Vocês chegavam de ônibus?" },
        ],
        subjuntivo: [
          { form: "chegasse", meaning: "if I arrived", pron: "sheh-GAH-see", example: "Ela agia como se eu chegasse sempre atrasado no trabalho." },
          { form: "chegasse", meaning: "if you arrived", pron: "sheh-GAH-see", example: "Se você chegasse mais cedo, a gente almoçava junto." },
          { form: "chegássemos", meaning: "if we arrived", pron: "sheh-GAH-seh-moosh", example: "Gostaria que nós chegássemos antes de escurecer." },
          { form: "chegassem", meaning: "if you all arrived", pron: "sheh-GAH-seng", example: "Era melhor que vocês chegassem juntos na festa." },
        ],
      },
    },
    {
      pt: "sair", en: "to go out", category: "Vida diária e mobilidade", irregular: true,
      tenses: {
        presente: [
          { form: "saio", meaning: "I leave / go out", pron: "SAH-yoo", example: "Eu saio do trabalho às seis." },
          { form: "sai", meaning: "you leave / go out", pron: "SY", example: "Você sai hoje à noite?" },
          { form: "saímos", meaning: "we leave / go out", pron: "sah-EE-moosh", example: "Nós saímos cedo de casa." },
          { form: "saem", meaning: "you all leave / go out", pron: "SAH-eng", example: "Vocês saem agora ou depois?" },
        ],
        perfeito: [
          { form: "saí", meaning: "I left / went out", pron: "sah-EE", example: "Eu saí cedo hoje." },
          { form: "saiu", meaning: "you left / went out", pron: "sah-EE-oo", example: "Você saiu ontem à noite?" },
          { form: "saímos", meaning: "we left / went out", pron: "sah-EE-moosh", example: "Nós saímos depois do jantar." },
          { form: "saíram", meaning: "you all left / went out", pron: "sah-EE-rahng", example: "Vocês saíram sem avisar?" },
        ],
        imperfeito: [
          { form: "saía", meaning: "I used to leave / go out / was leaving", pron: "sah-EE-ah", example: "Eu saía com os meus amigos todo sábado." },
          { form: "saía", meaning: "you used to leave / go out / were leaving", pron: "sah-EE-ah", example: "Você saía para correr de manhã?" },
          { form: "saíamos", meaning: "we used to leave / go out / were leaving", pron: "sah-EE-ah-moosh", example: "Nós saíamos para jantar no sábado." },
          { form: "saíam", meaning: "you all used to leave / go out / were leaving", pron: "sah-EE-ahng", example: "Vocês saíam do trabalho às cinco?" },
        ],
        subjuntivo: [
          { form: "saísse", meaning: "if I went out", pron: "sah-EE-see", example: "Minha mãe queria que eu saísse menos à noite." },
          { form: "saísse", meaning: "if you went out", pron: "sah-EE-see", example: "Se você saísse do trabalho cedo, ia comigo ao show." },
          { form: "saíssemos", meaning: "if we went out", pron: "sah-EE-seh-moosh", example: "Ele fechou a porta antes que nós saíssemos." },
          { form: "saíssem", meaning: "if you all went out", pron: "sah-EE-seng", example: "Era como se vocês saíssem só pra me irritar." },
        ],
      },
    },
    {
      pt: "entrar", en: "to enter, to get in, to come in", category: "Vida diária e mobilidade",
      tenses: {
        presente: [
          { form: "entro", meaning: "I enter", pron: "EN-troo", example: "Eu entro pela porta dos fundos." },
          { form: "entra", meaning: "you enter", pron: "EN-trah", example: "Você entra ou fica aqui fora?" },
          { form: "entramos", meaning: "we enter", pron: "en-TRAH-moosh", example: "Nós entramos juntos no show." },
          { form: "entram", meaning: "you all enter", pron: "EN-trahng", example: "Vocês entram sem pagar?" },
        ],
        perfeito: [
          { form: "entrei", meaning: "I entered / came in", pron: "en-TRAY", example: "Eu entrei pela porta dos fundos." },
          { form: "entrou", meaning: "you entered / came in", pron: "en-TROH", example: "Você entrou na reunião a tempo?" },
          { form: "entramos", meaning: "we entered / came in", pron: "en-TRAH-moosh", example: "Nós entramos no cinema juntos." },
          { form: "entraram", meaning: "you all entered / came in", pron: "en-TRAH-rahng", example: "Vocês entraram no sistema?" },
        ],
        imperfeito: [
          { form: "entrava", meaning: "I used to enter / go in / was entering", pron: "en-TRAH-vah", example: "Eu entrava pela porta dos fundos." },
          { form: "entrava", meaning: "you used to enter / go in / were entering", pron: "en-TRAH-vah", example: "Você entrava na aula em cima da hora?" },
          { form: "entrávamos", meaning: "we used to enter / go in / were entering", pron: "en-TRAH-vah-moosh", example: "Nós entrávamos juntos no prédio." },
          { form: "entravam", meaning: "you all used to enter / go in", pron: "en-TRAH-vahng", example: "Vocês entravam sem bater na porta?" },
        ],
      },
    },
    {
      pt: "pegar", en: "to take (bus, metro, Uber)", category: "Vida diária e mobilidade",
      tenses: {
        presente: [
          { form: "pego", meaning: "I grab", pron: "PEH-goo", example: "Eu pego o ônibus todo dia." },
          { form: "pega", meaning: "you grab", pron: "PEH-gah", example: "Você pega o metrô pra ir trabalhar?" },
          { form: "pegamos", meaning: "we grab", pron: "peh-GAH-moosh", example: "Nós pegamos um táxi pra ir." },
          { form: "pegam", meaning: "you all grab", pron: "PEH-gahng", example: "Vocês pegam a chave na recepção?" },
        ],
        perfeito: [
          { form: "peguei", meaning: "I grabbed / got", pron: "peh-GAY", example: "Eu peguei um táxi para o aeroporto." },
          { form: "pegou", meaning: "you grabbed / got", pron: "peh-GOH", example: "Você pegou o ônibus hoje?" },
          { form: "pegamos", meaning: "we grabbed / got", pron: "peh-GAH-moosh", example: "Nós pegamos a chave na recepção." },
          { form: "pegaram", meaning: "you all grabbed / got", pron: "peh-GAH-rahng", example: "Vocês pegaram os ingressos?" },
        ],
        imperfeito: [
          { form: "pegava", meaning: "I used to grab / pick up / was grabbing", pron: "peh-GAH-vah", example: "Eu pegava o ônibus todo dia." },
          { form: "pegava", meaning: "you used to grab / pick up / were grabbing", pron: "peh-GAH-vah", example: "Você pegava a mochila antes de sair?" },
          { form: "pegávamos", meaning: "we used to grab / pick up / were grabbing", pron: "peh-GAH-vah-moosh", example: "Nós pegávamos o metrô juntos." },
          { form: "pegavam", meaning: "you all used to grab / pick up", pron: "peh-GAH-vahng", example: "Vocês pegavam o mesmo caminho?" },
        ],
      },
    },
    {
      pt: "levar", en: "to take / carry", category: "Vida diária e mobilidade",
      tenses: {
        presente: [
          { form: "levo", meaning: "I take / carry", pron: "LEH-voo", example: "Eu levo meu filho à escola." },
          { form: "leva", meaning: "you take / carry", pron: "LEH-vah", example: "Você leva carteira com você?" },
          { form: "levamos", meaning: "we take / carry", pron: "leh-VAH-moosh", example: "Nós levamos água para a praia." },
          { form: "levam", meaning: "you all take / carry", pron: "LEH-vahng", example: "Vocês levam as crianças à escola?" },
        ],
        perfeito: [
          { form: "levei", meaning: "I took / carried", pron: "leh-VAY", example: "Eu levei um guarda-chuva comigo." },
          { form: "levou", meaning: "you took / carried", pron: "leh-VOH", example: "Você levou os documentos?" },
          { form: "levamos", meaning: "we took / carried", pron: "leh-VAH-moosh", example: "Nós levamos café para o escritório." },
          { form: "levaram", meaning: "you all took / carried", pron: "leh-VAH-rahng", example: "Vocês levaram as crianças à escola?" },
        ],
        imperfeito: [
          { form: "levava", meaning: "I used to take / carry / was taking", pron: "leh-VAH-vah", example: "Eu levava o lanche para a escola." },
          { form: "levava", meaning: "you used to take / carry / were taking", pron: "leh-VAH-vah", example: "Você levava o cachorro no parque?" },
          { form: "levávamos", meaning: "we used to take / carry / were taking", pron: "leh-VAH-vah-moosh", example: "Nós levávamos flores para a professora." },
          { form: "levavam", meaning: "you all used to take / carry / were taking", pron: "leh-VAH-vahng", example: "Vocês levavam a bicicleta na viagem?" },
        ],
        subjuntivo: [
          { form: "levasse", meaning: "if I took / carried", pron: "leh-VAH-see", example: "Se eu levasse o casaco, não passava frio agora." },
          { form: "levasse", meaning: "if you took / carried", pron: "leh-VAH-see", example: "Gostaria que você levasse as crianças pra escola amanhã." },
          { form: "levássemos", meaning: "if we took / carried", pron: "leh-VAH-seh-moosh", example: "Era melhor que nós levássemos um mapa nessa trilha amanhã." },
          { form: "levassem", meaning: "if you all took / carried", pron: "leh-VAH-seng", example: "Guardei tudo antes que vocês levassem as caixas erradas." },
        ],
      },
    },
    {
      pt: "buscar", en: "to fetch, to pick (someone) up", category: "Vida diária e mobilidade",
      tenses: {
        presente: [
          { form: "busco", meaning: "I fetch / pick up", pron: "BOOSH-koo", example: "Eu busco as crianças na escola às cinco." },
          { form: "busca", meaning: "you fetch / pick up", pron: "BOOSH-kah", example: "Você busca ela no aeroporto?" },
          { form: "buscamos", meaning: "we fetch / pick up", pron: "boosh-KAH-moosh", example: "Nós buscamos o bolo na confeitaria." },
          { form: "buscam", meaning: "you all fetch / pick up", pron: "BOOSH-kahng", example: "Vocês buscam o carro hoje?" },
        ],
        perfeito: [
          { form: "busquei", meaning: "I fetched / picked up", pron: "boosh-KAY", example: "Eu busquei ela no trabalho." },
          { form: "buscou", meaning: "you fetched / picked up", pron: "boosh-KOH", example: "Você buscou a encomenda?" },
          { form: "buscamos", meaning: "we fetched / picked up", pron: "boosh-KAH-moosh", example: "Nós buscamos os documentos ontem." },
          { form: "buscaram", meaning: "you all fetched / picked up", pron: "boosh-KAH-rahng", example: "Vocês buscaram as crianças?" },
        ],
        imperfeito: [
          { form: "buscava", meaning: "I used to fetch / pick up", pron: "boosh-KAH-vah", example: "Eu buscava meu irmão na escola." },
          { form: "buscava", meaning: "you used to fetch / pick up", pron: "boosh-KAH-vah", example: "Você buscava ela todo dia?" },
          { form: "buscávamos", meaning: "we used to fetch / pick up", pron: "boosh-KAH-vah-moosh", example: "Nós buscávamos pão fresco de manhã." },
          { form: "buscavam", meaning: "you all used to fetch / pick up", pron: "boosh-KAH-vahng", example: "Vocês buscavam os avós no domingo?" },
        ],
      },
    },
    {
      pt: "voltar", en: "to return", category: "Vida diária e mobilidade",
      tenses: {
        presente: [
          { form: "volto", meaning: "I return / come back", pron: "VOHL-too", example: "Eu volto amanhã." },
          { form: "volta", meaning: "you return / come back", pron: "VOHL-tah", example: "Você volta cedo para casa?" },
          { form: "voltamos", meaning: "we return / come back", pron: "vohl-TAH-moosh", example: "Nós voltamos depois do almoço." },
          { form: "voltam", meaning: "you all return / come back", pron: "VOHL-tahng", example: "Vocês voltam na segunda-feira?" },
        ],
        perfeito: [
          { form: "voltei", meaning: "I returned / came back", pron: "vohl-TAY", example: "Eu voltei cedo para casa." },
          { form: "voltou", meaning: "you returned / came back", pron: "vohl-TOH", example: "Você voltou tarde da viagem?" },
          { form: "voltamos", meaning: "we returned / came back", pron: "vohl-TAH-moosh", example: "Nós voltamos ontem depois do almoço." },
          { form: "voltaram", meaning: "you all returned / came back", pron: "vohl-TAH-rahng", example: "Vocês voltaram ontem à noite?" },
        ],
        imperfeito: [
          { form: "voltava", meaning: "I used to return / come back / was returning", pron: "vohl-TAH-vah", example: "Eu voltava para casa antes do jantar." },
          { form: "voltava", meaning: "you used to return / come back / were returning", pron: "vohl-TAH-vah", example: "Você voltava cedo da escola?" },
          { form: "voltávamos", meaning: "we used to return / come back / were returning", pron: "vohl-TAH-vah-moosh", example: "Nós voltávamos da praia todo domingo." },
          { form: "voltavam", meaning: "you all used to return / come back / were returning", pron: "vohl-TAH-vahng", example: "Vocês voltavam tarde da festa?" },
        ],
        subjuntivo: [
          { form: "voltasse", meaning: "if I returned", pron: "vohl-TAH-see", example: "Se eu voltasse pro Rio, morava em Ipanema de novo." },
          { form: "voltasse", meaning: "if you returned", pron: "vohl-TAH-see", example: "Gostaria que você voltasse pra casa mais cedo hoje." },
          { form: "voltássemos", meaning: "if we returned", pron: "vohl-TAH-seh-moosh", example: "Ela queria que nós voltássemos antes da meia-noite." },
          { form: "voltassem", meaning: "if you all returned", pron: "vohl-TAH-seng", example: "Era melhor que vocês voltassem de táxi hoje à noite." },
        ],
      },
    },
    {
      pt: "caminhar", en: "to walk", category: "Vida diária e mobilidade",
      tenses: {
        presente: [
          { form: "caminho", meaning: "I walk", pron: "kah-MEE-nyoo", example: "Eu caminho na praia toda manhã." },
          { form: "caminha", meaning: "you walk", pron: "kah-MEE-nyah", example: "Você caminha até o trabalho?" },
          { form: "caminhamos", meaning: "we walk", pron: "kah-mee-NYAH-moosh", example: "Nós caminhamos no parque." },
          { form: "caminham", meaning: "you all walk", pron: "kah-MEE-nyahng", example: "Vocês caminham muito por aqui?" },
        ],
        perfeito: [
          { form: "caminhei", meaning: "I walked", pron: "kah-mee-NYAY", example: "Eu caminhei até a padaria hoje cedo." },
          { form: "caminhou", meaning: "you walked", pron: "kah-mee-NYOH", example: "Você caminhou até a praia ontem?" },
          { form: "caminhamos", meaning: "we walked", pron: "kah-mee-NYAH-moosh", example: "Nós caminhamos bastante no fim de semana." },
          { form: "caminharam", meaning: "you all walked", pron: "kah-mee-NYAH-rahng", example: "Vocês caminharam pela orla?" },
        ],
        imperfeito: [
          { form: "caminhava", meaning: "I used to walk / was walking", pron: "kah-mee-NYAH-vah", example: "Eu caminhava todo dia antes do trabalho." },
          { form: "caminhava", meaning: "you used to walk / were walking", pron: "kah-mee-NYAH-vah", example: "Você caminhava até a escola?" },
          { form: "caminhávamos", meaning: "we used to walk / were walking", pron: "kah-mee-NYAH-vah-moosh", example: "Nós caminhávamos na orla toda tarde." },
          { form: "caminhavam", meaning: "you all used to walk / were walking", pron: "kah-mee-NYAH-vahng", example: "Vocês caminhavam juntos?" },
        ],
      },
    },
    {
      pt: "dirigir", en: "to drive", category: "Vida diária e mobilidade",
      tenses: {
        presente: [
          { form: "dirijo", meaning: "I drive", pron: "djee-REE-zhoo", example: "Eu dirijo para o trabalho." },
          { form: "dirige", meaning: "you drive", pron: "djee-REE-zhee", example: "Você dirige bem?" },
          { form: "dirigimos", meaning: "we drive", pron: "djee-ree-ZHEE-moosh", example: "Nós dirigimos até a praia." },
          { form: "dirigem", meaning: "you all drive", pron: "djee-REE-zheng", example: "Vocês dirigem à noite?" },
        ],
        perfeito: [
          { form: "dirigi", meaning: "I drove", pron: "djee-ree-ZHEE", example: "Eu dirigi até Niterói ontem." },
          { form: "dirigiu", meaning: "you drove", pron: "djee-ree-ZHEE-oo", example: "Você dirigiu a noite toda?" },
          { form: "dirigimos", meaning: "we drove", pron: "djee-ree-ZHEE-moosh", example: "Nós dirigimos com cuidado na chuva." },
          { form: "dirigiram", meaning: "you all drove", pron: "djee-ree-ZHEE-rahng", example: "Vocês dirigiram até tarde?" },
        ],
        imperfeito: [
          { form: "dirigia", meaning: "I used to drive / was driving", pron: "djee-ree-ZHEE-ah", example: "Eu dirigia devagar quando aprendi." },
          { form: "dirigia", meaning: "you used to drive / were driving", pron: "djee-ree-ZHEE-ah", example: "Você dirigia para o trabalho todo dia?" },
          { form: "dirigíamos", meaning: "we used to drive / were driving", pron: "djee-ree-ZHEE-ah-moosh", example: "Nós dirigíamos pelo mesmo caminho." },
          { form: "dirigiam", meaning: "you all used to drive / were driving", pron: "djee-ree-ZHEE-ahng", example: "Vocês dirigiam na madrugada?" },
        ],
      },
    },
    {
      pt: "ligar", en: "to call (phone), to turn on", category: "Vida diária e mobilidade",
      tenses: {
        presente: [
          { form: "ligo", meaning: "I call (phone)", pron: "LEE-goo", example: "Eu ligo pra você mais tarde." },
          { form: "liga", meaning: "you call (phone)", pron: "LEE-gah", example: "Você liga pra sua mãe todo dia?" },
          { form: "ligamos", meaning: "we call (phone)", pron: "lee-GAH-moosh", example: "Nós ligamos pra marcar a mesa." },
          { form: "ligam", meaning: "you all call (phone)", pron: "LEE-gahng", example: "Vocês ligam antes de chegar?" },
        ],
        perfeito: [
          { form: "liguei", meaning: "I called / turned on (phone)", pron: "lee-GAY", example: "Eu liguei para a clínica de manhã." },
          { form: "ligou", meaning: "you called / turned on (phone)", pron: "lee-GOH", example: "Você ligou para o restaurante?" },
          { form: "ligamos", meaning: "we called / turned on (phone)", pron: "lee-GAH-moosh", example: "Nós ligamos o ar-condicionado." },
          { form: "ligaram", meaning: "you all called / turned on (phone)", pron: "lee-GAH-rahng", example: "Vocês ligaram para avisar?" },
        ],
        imperfeito: [
          { form: "ligava", meaning: "I used to call / turn on / was calling (phone)", pron: "lee-GAH-vah", example: "Eu ligava pra ela todo fim de semana." },
          { form: "ligava", meaning: "you used to call / turn on / were calling (phone)", pron: "lee-GAH-vah", example: "Você ligava pro trabalho com frequência?" },
          { form: "ligávamos", meaning: "we used to call / turn on / were calling (phone)", pron: "lee-GAH-vah-moosh", example: "Nós ligávamos o rádio de manhã." },
          { form: "ligavam", meaning: "you all used to call / turn on (phone)", pron: "lee-GAH-vahng", example: "Vocês ligavam pra família às vezes?" },
        ],
      },
    },
    {
      pt: "desligar", en: "to turn off, to hang up", category: "Vida diária e mobilidade",
      tenses: {
        presente: [
          { form: "desligo", meaning: "I turn off / hang up", pron: "desh-LEE-goo", example: "Eu desligo o celular pra dormir." },
          { form: "desliga", meaning: "you turn off / hang up", pron: "desh-LEE-gah", example: "Você desliga a luz quando sai?" },
          { form: "desligamos", meaning: "we turn off / hang up", pron: "desh-lee-GAH-moosh", example: "Nós desligamos o ar antes de sair." },
          { form: "desligam", meaning: "you all turn off / hang up", pron: "desh-LEE-gahng", example: "Vocês desligam a TV de noite?" },
        ],
        perfeito: [
          { form: "desliguei", meaning: "I turned off / hung up", pron: "desh-lee-GAY", example: "Eu desliguei na cara dele sem querer." },
          { form: "desligou", meaning: "you turned off / hung up", pron: "desh-lee-GOH", example: "Você desligou o ferro?" },
          { form: "desligamos", meaning: "we turned off / hung up", pron: "desh-lee-GAH-moosh", example: "Nós desligamos tudo antes de viajar." },
          { form: "desligaram", meaning: "you all turned off / hung up", pron: "desh-lee-GAH-rahng", example: "Vocês desligaram o chuveiro?" },
        ],
        imperfeito: [
          { form: "desligava", meaning: "I used to turn off / hang up", pron: "desh-lee-GAH-vah", example: "Eu desligava o telefone pra estudar." },
          { form: "desligava", meaning: "you used to turn off / hang up", pron: "desh-lee-GAH-vah", example: "Você desligava a luz da sala?" },
          { form: "desligávamos", meaning: "we used to turn off / hang up", pron: "desh-lee-GAH-vah-moosh", example: "Nós desligávamos a TV na hora do jantar." },
          { form: "desligavam", meaning: "you all used to turn off / hang up", pron: "desh-lee-GAH-vahng", example: "Vocês desligavam o wi-fi de noite?" },
        ],
      },
    },
    {
      pt: "falar", en: "to speak, to talk", category: "Comunicação",
      tenses: {
        presente: [
          { form: "falo", meaning: "I speak / talk", pron: "FAH-loo", example: "Eu falo português." },
          { form: "fala", meaning: "you speak", pron: "FAH-lah", example: "Você fala inglês?" },
          { form: "falamos", meaning: "we speak / talk", pron: "fah-LAH-moosh", example: "Nós falamos no telefone." },
          { form: "falam", meaning: "you all speak / talk", pron: "FAH-lahng", example: "Vocês falam muito rápido." },
        ],
        perfeito: [
          { form: "falei", meaning: "I spoke / talked", pron: "fah-LAY", example: "Eu falei com a Ana ontem." },
          { form: "falou", meaning: "you spoke / talked", pron: "fah-LOH", example: "Você falou com o professor hoje cedo?" },
          { form: "falamos", meaning: "we spoke / talked", pron: "fah-LAH-moosh", example: "Nós falamos sobre o filme ontem à noite." },
          { form: "falaram", meaning: "you all spoke / talked", pron: "fah-LAH-rahng", example: "Vocês falaram com o garçom depois?" },
        ],
        imperfeito: [
          { form: "falava", meaning: "I used to speak / talk / was talking", pron: "fah-LAH-vah", example: "Eu falava português com os meus avós." },
          { form: "falava", meaning: "you used to speak / talk / were talking", pron: "fah-LAH-vah", example: "Você falava alto na aula?" },
          { form: "falávamos", meaning: "we used to speak / talk / were talking", pron: "fah-LAH-vah-moosh", example: "Nós falávamos no telefone toda noite." },
          { form: "falavam", meaning: "you all used to speak / talk / were talking", pron: "fah-LAH-vahng", example: "Vocês falavam inglês em casa?" },
        ],
        subjuntivo: [
          { form: "falasse", meaning: "if I spoke", pron: "fah-LAH-see", example: "Se eu falasse inglês, arrumava emprego melhor." },
          { form: "falasse", meaning: "if you spoke", pron: "fah-LAH-see", example: "Gostaria que você falasse mais baixo no telefone." },
          { form: "falássemos", meaning: "if we spoke", pron: "fah-LAH-seh-moosh", example: "Era melhor que nós falássemos com ela pessoalmente." },
          { form: "falassem", meaning: "if you all spoke", pron: "fah-LAH-seng", example: "Saí da sala antes que vocês falassem de mim." },
        ],
      },
    },
    {
      pt: "dizer", en: "to say", category: "Comunicação", irregular: true,
      tenses: {
        presente: [
          { form: "digo", meaning: "I say / tell", pron: "DJEE-goo", example: "Eu digo a verdade." },
          { form: "diz", meaning: "you say / tell", pron: "DJEESH", example: "Você diz que sim?" },
          { form: "dizemos", meaning: "we say / tell", pron: "djee-ZEH-moosh", example: "Nós dizemos obrigado." },
          { form: "dizem", meaning: "you all say / tell", pron: "DJEE-zeng", example: "Vocês dizem isso sempre?" },
        ],
        perfeito: [
          { form: "disse", meaning: "I said / told", pron: "DJEE-see", example: "Eu disse a verdade." },
          { form: "disse", meaning: "you said / told", pron: "DJEE-see", example: "Você disse isso para ele?" },
          { form: "dissemos", meaning: "we said / told", pron: "djee-SEH-moosh", example: "Nós dissemos tudo no começo." },
          { form: "disseram", meaning: "you all said / told", pron: "djee-SEH-rahng", example: "Vocês disseram que vinham hoje." },
        ],
        imperfeito: [
          { form: "dizia", meaning: "I used to say / was saying", pron: "djee-ZEE-ah", example: "Eu dizia a verdade para a minha mãe." },
          { form: "dizia", meaning: "you used to say / were saying", pron: "djee-ZEE-ah", example: "Você dizia tudo o que pensava?" },
          { form: "dizíamos", meaning: "we used to say / were saying", pron: "djee-ZEE-ah-moosh", example: "Nós dizíamos piada na hora do almoço." },
          { form: "diziam", meaning: "you all used to say / were saying", pron: "djee-ZEE-ahng", example: "Vocês diziam que iam voltar cedo?" },
        ],
        subjuntivo: [
          { form: "dissesse", meaning: "if I said", pron: "djee-SEH-see", example: "Ele queria que eu dissesse sim na hora." },
          { form: "dissesse", meaning: "if you said", pron: "djee-SEH-see", example: "Se você dissesse a verdade, ninguém brigava." },
          { form: "disséssemos", meaning: "if we said", pron: "djee-SEH-seh-moosh", example: "Ela saiu antes que nós disséssemos qualquer coisa." },
          { form: "dissessem", meaning: "if you all said", pron: "djee-SEH-seng", example: "Ele sorriu como se vocês dissessem algo engraçado." },
        ],
      },
    },
    {
      pt: "perguntar", en: "to ask", category: "Comunicação",
      tenses: {
        presente: [
          { form: "pergunto", meaning: "I ask", pron: "per-GOON-too", example: "Eu pergunto o caminho pra alguém." },
          { form: "pergunta", meaning: "you ask", pron: "per-GOON-tah", example: "Você pergunta pro garçom?" },
          { form: "perguntamos", meaning: "we ask", pron: "per-goon-TAH-moosh", example: "Nós perguntamos antes de entrar." },
          { form: "perguntam", meaning: "you all ask", pron: "per-GOON-tahng", example: "Vocês perguntam se não sabem?" },
        ],
        perfeito: [
          { form: "perguntei", meaning: "I asked", pron: "pehr-goon-TAY", example: "Eu perguntei o preço antes de comprar." },
          { form: "perguntou", meaning: "you asked", pron: "pehr-goon-TOH", example: "Você perguntou o endereço?" },
          { form: "perguntamos", meaning: "we asked", pron: "pehr-goon-TAH-moosh", example: "Nós perguntamos ao garçom." },
          { form: "perguntaram", meaning: "you all asked", pron: "pehr-goon-TAH-rahng", example: "Vocês perguntaram se tinha vaga?" },
        ],
        imperfeito: [
          { form: "perguntava", meaning: "I used to ask / was asking", pron: "pehr-goon-TAH-vah", example: "Eu perguntava quando tinha dúvida." },
          { form: "perguntava", meaning: "you used to ask / were asking", pron: "pehr-goon-TAH-vah", example: "Você perguntava o preço antes de comprar?" },
          { form: "perguntávamos", meaning: "we used to ask / were asking", pron: "pehr-goon-TAH-vah-moosh", example: "Nós perguntávamos o caminho sempre." },
          { form: "perguntavam", meaning: "you all used to ask", pron: "pehr-goon-TAH-vahng", example: "Vocês perguntavam a opinião dos outros?" },
        ],
        subjuntivo: [
          { form: "perguntasse", meaning: "if I asked", pron: "pehr-goon-TAH-see", example: "Se eu perguntasse o preço, você me falava?" },
          { form: "perguntasse", meaning: "if you asked", pron: "pehr-goon-TAH-see", example: "Queria que você perguntasse antes de mexer nas minhas coisas." },
          { form: "perguntássemos", meaning: "if we asked", pron: "pehr-goon-TAH-seh-moosh", example: "Era melhor que nós perguntássemos o caminho pra alguém." },
          { form: "perguntassem", meaning: "if you all asked", pron: "pehr-goon-TAH-seng", example: "Saí de fininho antes que vocês perguntassem qualquer coisa." },
        ],
      },
    },
    {
      pt: "responder", en: "to answer", category: "Comunicação",
      tenses: {
        presente: [
          { form: "respondo", meaning: "I answer", pron: "hesh-POHN-doo", example: "Eu respondo os emails de manhã." },
          { form: "responde", meaning: "you answer", pron: "hesh-POHN-dee", example: "Você responde a mensagem?" },
          { form: "respondemos", meaning: "we answer", pron: "hesh-pohn-DEH-moosh", example: "Nós respondemos todas as perguntas." },
          { form: "respondem", meaning: "you all answer", pron: "hesh-POHN-deng", example: "Vocês respondem juntos?" },
        ],
        perfeito: [
          { form: "respondi", meaning: "I answered / replied", pron: "hess-pon-DJEE", example: "Eu respondi o e-mail assim que vi." },
          { form: "respondeu", meaning: "you answered / replied", pron: "hess-pon-DAY-oo", example: "Você respondeu a mensagem dela?" },
          { form: "respondemos", meaning: "we answered / replied", pron: "hess-pon-DEH-moosh", example: "Nós respondemos todas as perguntas." },
          { form: "responderam", meaning: "you all answered / replied", pron: "hess-pon-DEH-rahng", example: "Vocês responderam ao convite?" },
        ],
        imperfeito: [
          { form: "respondia", meaning: "I used to answer / respond / was answering", pron: "heh-spon-DEE-ah", example: "Eu respondia todas as mensagens no dia." },
          { form: "respondia", meaning: "you used to answer / respond / were answering", pron: "heh-spon-DEE-ah", example: "Você respondia rápido aos e-mails?" },
          { form: "respondíamos", meaning: "we used to answer / respond / were answering", pron: "heh-spon-DEE-ah-moosh", example: "Nós respondíamos às perguntas com cuidado." },
          { form: "respondiam", meaning: "you all used to answer / respond", pron: "heh-spon-DEE-ahng", example: "Vocês respondiam as ligações sempre?" },
        ],
      },
    },
    {
      pt: "explicar", en: "to explain", category: "Comunicação",
      tenses: {
        presente: [
          { form: "explico", meaning: "I explain", pron: "esh-PLEE-koo", example: "Eu explico de novo se precisar." },
          { form: "explica", meaning: "you explain", pron: "esh-PLEE-kah", example: "Você explica a situação pra mim?" },
          { form: "explicamos", meaning: "we explain", pron: "esh-plee-KAH-moosh", example: "Nós explicamos o projeto na reunião." },
          { form: "explicam", meaning: "you all explain", pron: "esh-PLEE-kahng", example: "Vocês explicam como funciona?" },
        ],
        perfeito: [
          { form: "expliquei", meaning: "I explained", pron: "ess-plee-KAY", example: "Eu expliquei tudo com calma." },
          { form: "explicou", meaning: "you explained", pron: "ess-plee-KOH", example: "Você explicou o motivo para ela?" },
          { form: "explicamos", meaning: "we explained", pron: "ess-plee-KAH-moosh", example: "Nós explicamos a situação." },
          { form: "explicaram", meaning: "you all explained", pron: "ess-plee-KAH-rahng", example: "Vocês explicaram como funciona?" },
        ],
        imperfeito: [
          { form: "explicava", meaning: "I used to explain / was explaining", pron: "esh-plee-KAH-vah", example: "Eu explicava a matéria com calma." },
          { form: "explicava", meaning: "you used to explain / were explaining", pron: "esh-plee-KAH-vah", example: "Você explicava bem para os alunos?" },
          { form: "explicávamos", meaning: "we used to explain / were explaining", pron: "esh-plee-KAH-vah-moosh", example: "Nós explicávamos o problema sem pressa." },
          { form: "explicavam", meaning: "you all used to explain", pron: "esh-plee-KAH-vahng", example: "Vocês explicavam tudo em detalhes?" },
        ],
      },
    },
    {
      pt: "chamar", en: "to call", category: "Comunicação",
      tenses: {
        presente: [
          { form: "chamo", meaning: "I call (summon)", pron: "SHAH-moo", example: "Eu chamo um táxi." },
          { form: "chama", meaning: "you call / are called (by name)", pron: "SHAH-mah", example: "Como você se chama?" },
          { form: "chamamos", meaning: "we call (summon)", pron: "shah-MAH-moosh", example: "Nós chamamos o garçom." },
          { form: "chamam", meaning: "you all call (summon)", pron: "SHAH-mahng", example: "Vocês chamam um médico?" },
        ],
        perfeito: [
          { form: "chamei", meaning: "I called (summon)", pron: "shah-MAY", example: "Eu chamei a Marina ontem." },
          { form: "chamou", meaning: "you called (summon)", pron: "shah-MOH", example: "Você chamou o Uber?" },
          { form: "chamamos", meaning: "we called (summon)", pron: "shah-MAH-moosh", example: "Nós chamamos o garçom." },
          { form: "chamaram", meaning: "you all called (summon)", pron: "shah-MAH-rahng", example: "Vocês chamaram o médico?" },
        ],
        imperfeito: [
          { form: "chamava", meaning: "I used to call (by name)", pron: "shah-MAH-vah", example: "Eu chamava o meu cachorro de Rex." },
          { form: "chamava", meaning: "you used to call (by name)", pron: "shah-MAH-vah", example: "Você chamava a sua avó de vovó?" },
          { form: "chamávamos", meaning: "we used to call (summon)", pron: "shah-MAH-vah-moosh", example: "Nós chamávamos a vizinha para o café." },
          { form: "chamavam", meaning: "you all used to call (by name)", pron: "shah-MAH-vahng", example: "Vocês chamavam ele de Zé?" },
        ],
      },
    },
    {
      pt: "conversar", en: "to chat", category: "Comunicação",
      tenses: {
        presente: [
          { form: "converso", meaning: "I chat", pron: "kohn-VEHR-soo", example: "Eu converso com ela todo dia." },
          { form: "conversa", meaning: "you chat", pron: "kohn-VEHR-sah", example: "Você conversa muito no trabalho?" },
          { form: "conversamos", meaning: "we chat", pron: "kohn-vehr-SAH-moosh", example: "Nós conversamos sobre tudo." },
          { form: "conversam", meaning: "you all chat", pron: "kohn-VEHR-sahng", example: "Vocês conversam em português?" },
        ],
        perfeito: [
          { form: "conversei", meaning: "I chatted", pron: "kohn-vehr-SAY", example: "Eu conversei com o vizinho ontem." },
          { form: "conversou", meaning: "you chatted", pron: "kohn-vehr-SOH", example: "Você conversou com ela depois?" },
          { form: "conversamos", meaning: "we chatted", pron: "kohn-vehr-SAH-moosh", example: "Nós conversamos a noite toda." },
          { form: "conversaram", meaning: "you all chatted", pron: "kohn-vehr-SAH-rahng", example: "Vocês conversaram sobre o assunto?" },
        ],
        imperfeito: [
          { form: "conversava", meaning: "I used to chat / was chatting", pron: "kohn-vehr-SAH-vah", example: "Eu conversava com a minha vó toda semana." },
          { form: "conversava", meaning: "you used to chat / were chatting", pron: "kohn-vehr-SAH-vah", example: "Você conversava muito na aula?" },
          { form: "conversávamos", meaning: "we used to chat / were chatting", pron: "kohn-vehr-SAH-vah-moosh", example: "Nós conversávamos até tarde." },
          { form: "conversavam", meaning: "you all used to chat / were chatting", pron: "kohn-vehr-SAH-vahng", example: "Vocês conversavam sobre isso antes?" },
        ],
      },
    },
    {
      pt: "contar", en: "to tell, to count", category: "Comunicação",
      tenses: {
        presente: [
          { form: "conto", meaning: "I tell", pron: "KOHN-too", example: "Eu conto uma história pra dormir." },
          { form: "conta", meaning: "you tell", pron: "KOHN-tah", example: "Você conta tudo pra sua mãe?" },
          { form: "contamos", meaning: "we tell / count", pron: "kohn-TAH-moosh", example: "Nós contamos os dias que faltam." },
          { form: "contam", meaning: "you all tell", pron: "KOHN-tahng", example: "Vocês contam o que aconteceu?" },
        ],
        perfeito: [
          { form: "contei", meaning: "I told / counted", pron: "kon-TAY", example: "Eu contei tudo para ela." },
          { form: "contou", meaning: "you told / counted", pron: "kon-TOH", example: "Você contou a história direito?" },
          { form: "contamos", meaning: "we told / counted", pron: "kon-TAH-moosh", example: "Nós contamos os votos juntos." },
          { form: "contaram", meaning: "you all told / counted", pron: "kon-TAH-rahng", example: "Vocês contaram o que aconteceu?" },
        ],
        imperfeito: [
          { form: "contava", meaning: "I used to count / tell / was counting", pron: "kon-TAH-vah", example: "Eu contava histórias para os filhos." },
          { form: "contava", meaning: "you used to count / tell / were counting", pron: "kon-TAH-vah", example: "Você contava os dias até as férias?" },
          { form: "contávamos", meaning: "we used to count / tell / were counting", pron: "kon-TAH-vah-moosh", example: "Nós contávamos o dinheiro com cuidado." },
          { form: "contavam", meaning: "you all used to count / tell", pron: "kon-TAH-vahng", example: "Vocês contavam com a nossa ajuda?" },
        ],
      },
    },
    {
      pt: "repetir", en: "to repeat", category: "Comunicação", irregular: true,
      tenses: {
        presente: [
          { form: "repito", meaning: "I repeat", pron: "heh-PEE-too", example: "Eu repito a pergunta." },
          { form: "repete", meaning: "you repeat", pron: "heh-PEH-chee", example: "Você repete isso pra mim?" },
          { form: "repetimos", meaning: "we repeat", pron: "heh-peh-CHEE-moosh", example: "Nós repetimos o exercício." },
          { form: "repetem", meaning: "you all repeat", pron: "heh-PEH-teng", example: "Vocês repetem a frase?" },
        ],
        perfeito: [
          { form: "repeti", meaning: "I repeated", pron: "heh-peh-CHEE", example: "Eu repeti o nome dele duas vezes." },
          { form: "repetiu", meaning: "you repeated", pron: "heh-peh-CHEE-oo", example: "Você repetiu o que ela falou?" },
          { form: "repetimos", meaning: "we repeated", pron: "heh-peh-CHEE-moosh", example: "Nós repetimos a música no ensaio." },
          { form: "repetiram", meaning: "you all repeated", pron: "heh-peh-CHEE-rahng", example: "Vocês repetiram a pergunta?" },
        ],
        imperfeito: [
          { form: "repetia", meaning: "I used to repeat / was repeating", pron: "heh-peh-CHEE-ah", example: "Eu repetia as palavras pra decorar." },
          { form: "repetia", meaning: "you used to repeat / were repeating", pron: "heh-peh-CHEE-ah", example: "Você repetia a lição em voz alta?" },
          { form: "repetíamos", meaning: "we used to repeat / were repeating", pron: "heh-peh-CHEE-ah-moosh", example: "Nós repetíamos os exercícios toda aula." },
          { form: "repetiam", meaning: "you all used to repeat / were repeating", pron: "heh-peh-CHEE-ahng", example: "Vocês repetiam sempre a mesma coisa?" },
        ],
      },
    },
    {
      pt: "entender", en: "to understand", category: "Comunicação",
      tenses: {
        presente: [
          { form: "entendo", meaning: "I understand", pron: "en-TEN-doo", example: "Eu entendo a pergunta." },
          { form: "entende", meaning: "you understand", pron: "en-TEN-djee", example: "Você entende português?" },
          { form: "entendemos", meaning: "we understand", pron: "en-ten-DEH-moosh", example: "Nós entendemos a ideia." },
          { form: "entendem", meaning: "you all understand", pron: "en-TEN-deng", example: "Vocês entendem o professor?" },
        ],
        perfeito: [
          { form: "entendi", meaning: "I understood", pron: "en-ten-DJEE", example: "Eu entendi tudo na aula." },
          { form: "entendeu", meaning: "you understood", pron: "en-ten-DEH-oo", example: "Você entendeu a explicação?" },
          { form: "entendemos", meaning: "we understood", pron: "en-ten-DEH-moosh", example: "Nós entendemos o problema ontem." },
          { form: "entenderam", meaning: "you all understood", pron: "en-ten-DEH-rahng", example: "Vocês entenderam a mensagem?" },
        ],
        imperfeito: [
          { form: "entendia", meaning: "I used to understand", pron: "en-ten-DJEE-ah", example: "Eu entendia tudo o que a professora falava." },
          { form: "entendia", meaning: "you used to understand", pron: "en-ten-DJEE-ah", example: "Você entendia as instruções?" },
          { form: "entendíamos", meaning: "we used to understand", pron: "en-ten-DJEE-ah-moosh", example: "Nós entendíamos uns aos outros sem falar." },
          { form: "entendiam", meaning: "you all used to understand", pron: "en-ten-DJEE-ahng", example: "Vocês entendiam a lição?" },
        ],
      },
    },
    {
      pt: "aprender", en: "to learn", category: "Comunicação",
      tenses: {
        presente: [
          { form: "aprendo", meaning: "I learn", pron: "ah-PREN-doo", example: "Eu aprendo português todos os dias." },
          { form: "aprende", meaning: "you learn", pron: "ah-PREN-djee", example: "Você aprende rápido?" },
          { form: "aprendemos", meaning: "we learn", pron: "ah-pren-DEH-moosh", example: "Nós aprendemos juntos." },
          { form: "aprendem", meaning: "you all learn", pron: "ah-PREN-deng", example: "Vocês aprendem com a prática." },
        ],
        perfeito: [
          { form: "aprendi", meaning: "I learned", pron: "ah-pren-DJEE", example: "Eu aprendi muita coisa na aula." },
          { form: "aprendeu", meaning: "you learned", pron: "ah-pren-DEH-oo", example: "Você aprendeu isso sozinho?" },
          { form: "aprendemos", meaning: "we learned", pron: "ah-pren-DEH-moosh", example: "Nós aprendemos uma expressão nova ontem." },
          { form: "aprenderam", meaning: "you all learned", pron: "ah-pren-DEH-rahng", example: "Vocês aprenderam rápido." },
        ],
        imperfeito: [
          { form: "aprendia", meaning: "I used to learn / was learning", pron: "ah-pren-DJEE-ah", example: "Eu aprendia português na escola." },
          { form: "aprendia", meaning: "you used to learn / were learning", pron: "ah-pren-DJEE-ah", example: "Você aprendia piano quando era pequeno?" },
          { form: "aprendíamos", meaning: "we used to learn / were learning", pron: "ah-pren-DJEE-ah-moosh", example: "Nós aprendíamos coisas novas todo dia." },
          { form: "aprendiam", meaning: "you all used to learn / were learning", pron: "ah-pren-DJEE-ahng", example: "Vocês aprendiam rápido na aula?" },
        ],
      },
    },
    {
      pt: "ensinar", en: "to teach", category: "Comunicação",
      tenses: {
        presente: [
          { form: "ensino", meaning: "I teach", pron: "en-SEE-noo", example: "Eu ensino inglês pra crianças." },
          { form: "ensina", meaning: "you teach", pron: "en-SEE-nah", example: "Você ensina português pra gringo?" },
          { form: "ensinamos", meaning: "we teach", pron: "en-see-NAH-moosh", example: "Nós ensinamos surfe na praia." },
          { form: "ensinam", meaning: "you all teach", pron: "en-SEE-nahng", example: "Vocês ensinam na mesma escola?" },
        ],
        perfeito: [
          { form: "ensinei", meaning: "I taught", pron: "en-see-NAY", example: "Eu ensinei ela a nadar." },
          { form: "ensinou", meaning: "you taught", pron: "en-see-NOH", example: "Você ensinou ele a dirigir?" },
          { form: "ensinamos", meaning: "we taught", pron: "en-see-NAH-moosh", example: "Nós ensinamos a receita pra todo mundo." },
          { form: "ensinaram", meaning: "you all taught", pron: "en-see-NAH-rahng", example: "Vocês ensinaram o caminho pra ele?" },
        ],
        imperfeito: [
          { form: "ensinava", meaning: "I used to teach", pron: "en-see-NAH-vah", example: "Eu ensinava matemática antes." },
          { form: "ensinava", meaning: "you used to teach", pron: "en-see-NAH-vah", example: "Você ensinava violão?" },
          { form: "ensinávamos", meaning: "we used to teach", pron: "en-see-NAH-vah-moosh", example: "Nós ensinávamos as crianças a ler." },
          { form: "ensinavam", meaning: "you all used to teach", pron: "en-see-NAH-vahng", example: "Vocês ensinavam no mesmo colégio?" },
        ],
      },
    },
    {
      pt: "sugerir", en: "to suggest", category: "Comunicação", irregular: true,
      tenses: {
        presente: [
          { form: "sugiro", meaning: "I suggest", pron: "soo-ZHEE-roo", example: "Eu sugiro um restaurante perto daqui." },
          { form: "sugere", meaning: "you suggest", pron: "soo-ZHEH-ree", example: "Você sugere algum lugar?" },
          { form: "sugerimos", meaning: "we suggest", pron: "soo-zhe-REE-moosh", example: "Nós sugerimos sair mais cedo." },
          { form: "sugerem", meaning: "you all suggest", pron: "soo-ZHEH-reng", example: "Vocês sugerem outro dia?" },
        ],
        perfeito: [
          { form: "sugeri", meaning: "I suggested", pron: "soo-zheh-REE", example: "Eu sugeri um restaurante novo." },
          { form: "sugeriu", meaning: "you suggested", pron: "soo-zhe-REE-oo", example: "Você sugeriu outro horário?" },
          { form: "sugerimos", meaning: "we suggested", pron: "soo-zhe-REE-moosh", example: "Nós sugerimos sair mais cedo." },
          { form: "sugeriram", meaning: "you all suggested", pron: "soo-zhe-REE-rahng", example: "Vocês sugeriram o mesmo lugar?" },
        ],
        imperfeito: [
          { form: "sugeria", meaning: "I used to suggest", pron: "soo-zheh-REE-ah", example: "Eu sempre sugeria o mesmo restaurante." },
          { form: "sugeria", meaning: "you used to suggest", pron: "soo-zheh-REE-ah", example: "Você sugeria filmes para a gente?" },
          { form: "sugeríamos", meaning: "we used to suggest", pron: "soo-zheh-REE-ah-moosh", example: "Nós sugeríamos lugares para visitar." },
          { form: "sugeriam", meaning: "you all used to suggest", pron: "soo-zheh-REE-ahng", example: "Vocês sugeriam ideias na reunião?" },
        ],
      },
    },
    {
      pt: "receber", en: "to receive, to get (mail, a message)", category: "Comunicação",
      tenses: {
        presente: [
          { form: "recebo", meaning: "I receive / get (mail, a message)", pron: "heh-SEH-boo", example: "Eu recebo muita mensagem de trabalho." },
          { form: "recebe", meaning: "you receive / get (mail, a message)", pron: "heh-SEH-bee", example: "Você recebe o salário no dia cinco?" },
          { form: "recebemos", meaning: "we receive / get (mail, a message)", pron: "heh-seh-BEH-moosh", example: "Nós recebemos encomenda na portaria." },
          { form: "recebem", meaning: "you all receive / get (mail, a message)", pron: "heh-SEH-beng", example: "Vocês recebem a conta por e-mail?" },
        ],
        perfeito: [
          { form: "recebi", meaning: "I received / got", pron: "heh-seh-BEE", example: "Eu recebi seu e-mail agora." },
          { form: "recebeu", meaning: "you received / got", pron: "heh-seh-BEH-oo", example: "Você recebeu a minha mensagem?" },
          { form: "recebemos", meaning: "we received / got", pron: "heh-seh-BEH-moosh", example: "Nós recebemos a notícia ontem." },
          { form: "receberam", meaning: "you all received / got", pron: "heh-seh-BEH-rahng", example: "Vocês receberam o convite?" },
        ],
        imperfeito: [
          { form: "recebia", meaning: "I used to receive / get", pron: "heh-seh-BEE-ah", example: "Eu recebia carta da minha avó todo mês." },
          { form: "recebia", meaning: "you used to receive / get", pron: "heh-seh-BEE-ah", example: "Você recebia visita todo fim de semana?" },
          { form: "recebíamos", meaning: "we used to receive / get", pron: "heh-seh-BEE-ah-moosh", example: "Nós recebíamos os vizinhos pra jantar." },
          { form: "recebiam", meaning: "you all used to receive / get", pron: "heh-seh-BEE-ahng", example: "Vocês recebiam ajuda dos pais?" },
        ],
      },
    },
    {
      pt: "mandar", en: "to send", category: "Comunicação",
      tenses: {
        presente: [
          { form: "mando", meaning: "I send", pron: "MAHN-doo", example: "Eu mando mensagem quando chegar." },
          { form: "manda", meaning: "you send", pron: "MAHN-dah", example: "Você manda a localização pra mim?" },
          { form: "mandamos", meaning: "we send", pron: "mahn-DAH-moosh", example: "Nós mandamos o presente pelo correio." },
          { form: "mandam", meaning: "you all send", pron: "MAHN-dahng", example: "Vocês mandam foto do bebê?" },
        ],
        perfeito: [
          { form: "mandei", meaning: "I sent", pron: "mahn-DAY", example: "Eu mandei o áudio agora." },
          { form: "mandou", meaning: "you sent", pron: "mahn-DOH", example: "Você mandou o endereço?" },
          { form: "mandamos", meaning: "we sent", pron: "mahn-DAH-moosh", example: "Nós mandamos o convite ontem." },
          { form: "mandaram", meaning: "you all sent", pron: "mahn-DAH-rahng", example: "Vocês mandaram o documento pra ela?" },
        ],
        imperfeito: [
          { form: "mandava", meaning: "I used to send", pron: "mahn-DAH-vah", example: "Eu mandava cartão postal de toda viagem." },
          { form: "mandava", meaning: "you used to send", pron: "mahn-DAH-vah", example: "Você mandava mensagem todo dia?" },
          { form: "mandávamos", meaning: "we used to send", pron: "mahn-DAH-vah-moosh", example: "Nós mandávamos e-mail, não WhatsApp." },
          { form: "mandavam", meaning: "you all used to send", pron: "mahn-DAH-vahng", example: "Vocês mandavam dinheiro pra família?" },
        ],
      },
    },
    {
      pt: "avisar", en: "to let (someone) know, to warn", category: "Comunicação",
      tenses: {
        presente: [
          { form: "aviso", meaning: "I let (you) know", pron: "ah-VEE-zoo", example: "Eu aviso quando chegar." },
          { form: "avisa", meaning: "you let (me) know", pron: "ah-VEE-zah", example: "Você me avisa se atrasar?" },
          { form: "avisamos", meaning: "we let (you) know", pron: "ah-vee-ZAH-moosh", example: "Nós avisamos o porteiro sempre." },
          { form: "avisam", meaning: "you all let (me) know", pron: "ah-VEE-zahng", example: "Vocês avisam quando estiverem chegando?" },
        ],
        perfeito: [
          { form: "avisei", meaning: "I let (you) know / warned", pron: "ah-vee-ZAY", example: "Eu avisei que ia chover." },
          { form: "avisou", meaning: "you let (me) know / warned", pron: "ah-vee-ZOH", example: "Você avisou a sua mãe?" },
          { form: "avisamos", meaning: "we let (them) know / warned", pron: "ah-vee-ZAH-moosh", example: "Nós avisamos todo mundo do horário novo." },
          { form: "avisaram", meaning: "you all let (me) know / warned", pron: "ah-vee-ZAH-rahng", example: "Vocês avisaram que não vinham?" },
        ],
        imperfeito: [
          { form: "avisava", meaning: "I used to let (you) know / warn", pron: "ah-vee-ZAH-vah", example: "Eu sempre avisava antes de aparecer." },
          { form: "avisava", meaning: "you used to let (me) know / warn", pron: "ah-vee-ZAH-vah", example: "Você avisava quando ia chegar tarde?" },
          { form: "avisávamos", meaning: "we used to let (them) know / warn", pron: "ah-vee-ZAH-vah-moosh", example: "Nós avisávamos a vizinha quando viajávamos." },
          { form: "avisavam", meaning: "you all used to let (me) know / warn", pron: "ah-vee-ZAH-vahng", example: "Vocês avisavam os pais quando saíam?" },
        ],
      },
    },
    {
      pt: "comprar", en: "to buy", category: "Consumo e serviços",
      tenses: {
        presente: [
          { form: "compro", meaning: "I buy", pron: "KOHM-proo", example: "Eu compro pão." },
          { form: "compra", meaning: "you buy", pron: "KOHM-prah", example: "Você compra fruta na feira?" },
          { form: "compramos", meaning: "we buy", pron: "kohm-PRAH-moosh", example: "Nós compramos comida para a semana." },
          { form: "compram", meaning: "you all buy", pron: "KOHM-prahng", example: "Vocês compram online?" },
        ],
        perfeito: [
          { form: "comprei", meaning: "I bought", pron: "kohm-PRAY", example: "Eu comprei pão na padaria." },
          { form: "comprou", meaning: "you bought", pron: "kohm-PROH", example: "Você comprou o presente ontem?" },
          { form: "compramos", meaning: "we bought", pron: "kohm-PRAH-moosh", example: "Nós compramos frutas na feira." },
          { form: "compraram", meaning: "you all bought", pron: "kohm-PRAH-rahng", example: "Vocês compraram as passagens já?" },
        ],
        imperfeito: [
          { form: "comprava", meaning: "I used to buy / was buying", pron: "kohm-PRAH-vah", example: "Eu comprava pão na padaria todo dia." },
          { form: "comprava", meaning: "you used to buy / were buying", pron: "kohm-PRAH-vah", example: "Você comprava revista toda semana?" },
          { form: "comprávamos", meaning: "we used to buy / were buying", pron: "kohm-PRAH-vah-moosh", example: "Nós comprávamos fruta no mercado." },
          { form: "compravam", meaning: "you all used to buy / were buying", pron: "kohm-PRAH-vahng", example: "Vocês compravam ingresso antecipado?" },
        ],
        subjuntivo: [
          { form: "comprasse", meaning: "if I bought", pron: "kohm-PRAH-see", example: "Se eu comprasse aquele apartamento, ficava sem dinheiro nenhum." },
          { form: "comprasse", meaning: "if you bought", pron: "kohm-PRAH-see", example: "Queria que você comprasse pão na volta do trabalho." },
          { form: "comprássemos", meaning: "if we bought", pron: "kohm-PRAH-seh-moosh", example: "Era melhor que nós comprássemos os ingressos hoje mesmo." },
          { form: "comprassem", meaning: "if you all bought", pron: "kohm-PRAH-seng", example: "Gostaria que vocês comprassem os presentes com antecedência." },
        ],
      },
    },
    {
      pt: "pagar", en: "to pay", category: "Consumo e serviços",
      tenses: {
        presente: [
          { form: "pago", meaning: "I pay", pron: "PAH-goo", example: "Eu pago com cartão." },
          { form: "paga", meaning: "you pay", pron: "PAH-gah", example: "Você paga a conta?" },
          { form: "pagamos", meaning: "we pay", pron: "pah-GAH-moosh", example: "Nós pagamos a metade cada um." },
          { form: "pagam", meaning: "you all pay", pron: "PAH-gahng", example: "Vocês pagam junto ou separado?" },
        ],
        perfeito: [
          { form: "paguei", meaning: "I paid", pron: "pah-GAY", example: "Eu paguei a conta no fim." },
          { form: "pagou", meaning: "you paid", pron: "pah-GOH", example: "Você pagou com cartão?" },
          { form: "pagamos", meaning: "we paid", pron: "pah-GAH-moosh", example: "Nós pagamos tudo ontem." },
          { form: "pagaram", meaning: "you all paid", pron: "pah-GAH-rahng", example: "Vocês pagaram adiantado?" },
        ],
        imperfeito: [
          { form: "pagava", meaning: "I used to pay / was paying", pron: "pah-GAH-vah", example: "Eu pagava o lanche com o meu dinheiro." },
          { form: "pagava", meaning: "you used to pay / were paying", pron: "pah-GAH-vah", example: "Você pagava a passagem de ônibus?" },
          { form: "pagávamos", meaning: "we used to pay / were paying", pron: "pah-GAH-vah-moosh", example: "Nós pagávamos a conta dividida." },
          { form: "pagavam", meaning: "you all used to pay / were paying", pron: "pah-GAH-vahng", example: "Vocês pagavam em dinheiro?" },
        ],
        subjuntivo: [
          { form: "pagasse", meaning: "if I paid", pron: "pah-GAH-see", example: "Se eu pagasse todas as contas hoje, ficava zerado." },
          { form: "pagasse", meaning: "if you paid", pron: "pah-GAH-see", example: "Ela gostaria que você pagasse a sua parte logo." },
          { form: "pagássemos", meaning: "if we paid", pron: "pah-GAH-seh-moosh", example: "Ele sumiu antes que nós pagássemos a conta do bar." },
          { form: "pagassem", meaning: "if you all paid", pron: "pah-GAH-seng", example: "Queria que vocês pagassem o aluguel sem atraso." },
        ],
      },
    },
    {
      pt: "gastar", en: "to spend (money)", category: "Consumo e serviços",
      tenses: {
        presente: [
          { form: "gasto", meaning: "I spend (money)", pron: "GAHSH-too", example: "Eu gasto muito com comida." },
          { form: "gasta", meaning: "you spend (money)", pron: "GAHSH-tah", example: "Você gasta quanto de aluguel?" },
          { form: "gastamos", meaning: "we spend (money)", pron: "gash-TAH-moosh", example: "Nós gastamos pouco morando juntos." },
          { form: "gastam", meaning: "you all spend (money)", pron: "GAHSH-tahng", example: "Vocês gastam muito com Uber?" },
        ],
        perfeito: [
          { form: "gastei", meaning: "I spent (money)", pron: "gash-TAY", example: "Eu gastei tudo na viagem." },
          { form: "gastou", meaning: "you spent (money)", pron: "gash-TOH", example: "Você gastou quanto no mercado?" },
          { form: "gastamos", meaning: "we spent (money)", pron: "gash-TAH-moosh", example: "Nós gastamos mais do que devíamos." },
          { form: "gastaram", meaning: "you all spent (money)", pron: "gash-TAH-rahng", example: "Vocês gastaram muito no show?" },
        ],
        imperfeito: [
          { form: "gastava", meaning: "I used to spend (money)", pron: "gash-TAH-vah", example: "Eu gastava tudo em roupa." },
          { form: "gastava", meaning: "you used to spend (money)", pron: "gash-TAH-vah", example: "Você gastava muito quando era solteiro?" },
          { form: "gastávamos", meaning: "we used to spend (money)", pron: "gash-TAH-vah-moosh", example: "Nós gastávamos pouco com lazer." },
          { form: "gastavam", meaning: "you all used to spend (money)", pron: "gash-TAH-vahng", example: "Vocês gastavam mais antes?" },
        ],
      },
    },
    {
      pt: "usar", en: "to use", category: "Consumo e serviços",
      tenses: {
        presente: [
          { form: "uso", meaning: "I use", pron: "OO-zoo", example: "Eu uso o celular para estudar." },
          { form: "usa", meaning: "you use", pron: "OO-zah", example: "Você usa esse aplicativo?" },
          { form: "usamos", meaning: "we use", pron: "oo-ZAH-moosh", example: "Nós usamos o ônibus todos os dias." },
          { form: "usam", meaning: "you all use", pron: "OO-zahng", example: "Vocês usam dicionário?" },
        ],
        perfeito: [
          { form: "usei", meaning: "I used", pron: "oo-ZAY", example: "Eu usei o cartão ontem." },
          { form: "usou", meaning: "you used", pron: "oo-ZOH", example: "Você usou o celular dele?" },
          { form: "usamos", meaning: "we used", pron: "oo-ZAH-moosh", example: "Nós usamos o aplicativo novo." },
          { form: "usaram", meaning: "you all used", pron: "oo-ZAH-rahng", example: "Vocês usaram o mesmo caminho?" },
        ],
        imperfeito: [
          { form: "usava", meaning: "I used to use / wear", pron: "oo-ZAH-vah", example: "Eu usava uniforme na escola." },
          { form: "usava", meaning: "you used to use / wear", pron: "oo-ZAH-vah", example: "Você usava óculos quando era criança?" },
          { form: "usávamos", meaning: "we used to use / wear", pron: "oo-ZAH-vah-moosh", example: "Nós usávamos o mesmo computador." },
          { form: "usavam", meaning: "you all used to use / wear", pron: "oo-ZAH-vahng", example: "Vocês usavam boné no sol?" },
        ],
      },
    },
    {
      pt: "pedir", en: "to order / request", category: "Consumo e serviços", irregular: true,
      tenses: {
        presente: [
          { form: "peço", meaning: "I ask for / order", pron: "PEH-soo", example: "Eu peço um café." },
          { form: "pede", meaning: "you ask for / order", pron: "PEH-djee", example: "Você pede a conta?" },
          { form: "pedimos", meaning: "we ask for / order", pron: "peh-DJEE-moosh", example: "Nós pedimos pizza." },
          { form: "pedem", meaning: "you all ask for / order", pron: "PEH-deng", example: "Vocês pedem desconto?" },
        ],
        perfeito: [
          { form: "pedi", meaning: "I asked for / ordered", pron: "peh-DJEE", example: "Eu pedi um suco no bar." },
          { form: "pediu", meaning: "you asked for / ordered", pron: "peh-DJEE-oo", example: "Você pediu a conta?" },
          { form: "pedimos", meaning: "we asked for / ordered", pron: "peh-DJEE-moosh", example: "Nós pedimos pizza ontem." },
          { form: "pediram", meaning: "you all asked for / ordered", pron: "peh-DJEE-rahng", example: "Vocês pediram desconto?" },
        ],
        imperfeito: [
          { form: "pedia", meaning: "I used to ask for / order", pron: "peh-DJEE-ah", example: "Eu pedia pizza todo sábado." },
          { form: "pedia", meaning: "you used to ask for / order", pron: "peh-DJEE-ah", example: "Você pedia ajuda quando precisava?" },
          { form: "pedíamos", meaning: "we used to ask for / order", pron: "peh-DJEE-ah-moosh", example: "Nós pedíamos comida no mesmo restaurante." },
          { form: "pediam", meaning: "you all used to ask for / order", pron: "peh-DJEE-ahng", example: "Vocês pediam refrigerante no almoço?" },
        ],
        subjuntivo: [
          { form: "pedisse", meaning: "if I asked for / ordered", pron: "peh-DJEE-see", example: "Ela queria que eu pedisse desculpa pra ele." },
          { form: "pedisse", meaning: "if you asked for / ordered", pron: "peh-DJEE-see", example: "Se você pedisse com jeitinho, ela deixava." },
          { form: "pedíssemos", meaning: "if we asked for / ordered", pron: "peh-DJEE-seh-moosh", example: "Era melhor que nós pedíssemos uma pizza grande." },
          { form: "pedissem", meaning: "if you all asked for / ordered", pron: "peh-DJEE-seng", example: "O garçom sumiu antes que vocês pedissem a sobremesa." },
        ],
      },
    },
    {
      pt: "abrir", en: "to open", category: "Consumo e serviços",
      tenses: {
        presente: [
          { form: "abro", meaning: "I open", pron: "AH-broo", example: "Eu abro a porta." },
          { form: "abre", meaning: "you open", pron: "AH-bree", example: "Você abre a janela?" },
          { form: "abrimos", meaning: "we open", pron: "ah-BREE-moosh", example: "Nós abrimos a loja às nove." },
          { form: "abrem", meaning: "you all open", pron: "AH-breng", example: "Vocês abrem os livros na página dez." },
        ],
        perfeito: [
          { form: "abri", meaning: "I opened", pron: "ah-BREE", example: "Eu abri a janela de manhã." },
          { form: "abriu", meaning: "you opened", pron: "ah-BREE-oo", example: "Você abriu a porta para ele?" },
          { form: "abrimos", meaning: "we opened", pron: "ah-BREE-moosh", example: "Nós abrimos a loja às nove." },
          { form: "abriram", meaning: "you all opened", pron: "ah-BREE-rahng", example: "Vocês abriram a garrafa já?" },
        ],
        imperfeito: [
          { form: "abria", meaning: "I used to open / was opening", pron: "ah-BREE-ah", example: "Eu abria a janela todo dia de manhã." },
          { form: "abria", meaning: "you used to open / were opening", pron: "ah-BREE-ah", example: "Você abria a porta para os visitantes?" },
          { form: "abríamos", meaning: "we used to open / were opening", pron: "ah-BREE-ah-moosh", example: "Nós abríamos a loja às oito." },
          { form: "abriam", meaning: "you all used to open / were opening", pron: "ah-BREE-ahng", example: "Vocês abriam os presentes no Natal?" },
        ],
      },
    },
    {
      pt: "fechar", en: "to close", category: "Consumo e serviços",
      tenses: {
        presente: [
          { form: "fecho", meaning: "I close", pron: "FEH-shoo", example: "Eu fecho a porta." },
          { form: "fecha", meaning: "you close", pron: "FEH-shah", example: "Você fecha a janela?" },
          { form: "fechamos", meaning: "we close", pron: "feh-SHAH-moosh", example: "Nós fechamos a loja às seis." },
          { form: "fecham", meaning: "you all close", pron: "FEH-shahng", example: "Vocês fecham o restaurante tarde?" },
        ],
        perfeito: [
          { form: "fechei", meaning: "I closed", pron: "feh-SHAY", example: "Eu fechei a porta ao sair." },
          { form: "fechou", meaning: "you closed", pron: "feh-SHOH", example: "Você fechou a janela?" },
          { form: "fechamos", meaning: "we closed", pron: "feh-SHAH-moosh", example: "Nós fechamos a loja às dez." },
          { form: "fecharam", meaning: "you all closed", pron: "feh-SHAH-rahng", example: "Vocês fecharam o acordo ontem?" },
        ],
        imperfeito: [
          { form: "fechava", meaning: "I used to close / was closing", pron: "feh-SHAH-vah", example: "Eu fechava a porta à noite." },
          { form: "fechava", meaning: "you used to close / were closing", pron: "feh-SHAH-vah", example: "Você fechava o caderno depois da aula?" },
          { form: "fechávamos", meaning: "we used to close / were closing", pron: "feh-SHAH-vah-moosh", example: "Nós fechávamos a loja às dez." },
          { form: "fechavam", meaning: "you all used to close / were closing", pron: "feh-SHAH-vahng", example: "Vocês fechavam as janelas quando chovia?" },
        ],
      },
    },
    {
      pt: "vender", en: "to sell", category: "Consumo e serviços",
      tenses: {
        presente: [
          { form: "vendo", meaning: "I sell", pron: "VEHN-doo", example: "Eu vendo bolo na feira." },
          { form: "vende", meaning: "you sell", pron: "VEHN-djee", example: "Você vende o carro?" },
          { form: "vendemos", meaning: "we sell", pron: "vehn-DEH-moosh", example: "Nós vendemos de tudo aqui." },
          { form: "vendem", meaning: "you all sell", pron: "VEHN-deng", example: "Vocês vendem açaí?" },
        ],
        perfeito: [
          { form: "vendi", meaning: "I sold", pron: "vehn-DJEE", example: "Eu vendi a bicicleta ontem." },
          { form: "vendeu", meaning: "you sold", pron: "vehn-DEH-oo", example: "Você vendeu tudo?" },
          { form: "vendemos", meaning: "we sold", pron: "vehn-DEH-moosh", example: "Nós vendemos a casa no ano passado." },
          { form: "venderam", meaning: "you all sold", pron: "vehn-DEH-rahng", example: "Vocês venderam muito hoje?" },
        ],
        imperfeito: [
          { form: "vendia", meaning: "I used to sell / was selling", pron: "vehn-DJEE-ah", example: "Eu vendia doce na escola." },
          { form: "vendia", meaning: "you used to sell / were selling", pron: "vehn-DJEE-ah", example: "Você vendia coisa na internet?" },
          { form: "vendíamos", meaning: "we used to sell / were selling", pron: "vehn-DJEE-ah-moosh", example: "Nós vendíamos água na praia." },
          { form: "vendiam", meaning: "you all used to sell / were selling", pron: "vehn-DJEE-ahng", example: "Vocês vendiam isso antes?" },
        ],
      },
    },
    {
      pt: "trocar", en: "to exchange", category: "Consumo e serviços",
      tenses: {
        presente: [
          { form: "troco", meaning: "I exchange", pron: "TROH-koo", example: "Eu troco dinheiro no aeroporto." },
          { form: "troca", meaning: "you exchange", pron: "TROH-kah", example: "Você troca a camisa se não servir?" },
          { form: "trocamos", meaning: "we exchange", pron: "troh-KAH-moosh", example: "Nós trocamos presentes no Natal." },
          { form: "trocam", meaning: "you all exchange", pron: "TROH-kahng", example: "Vocês trocam mensagem todo dia?" },
        ],
        perfeito: [
          { form: "troquei", meaning: "I exchanged", pron: "troh-KAY", example: "Eu troquei o tênis por um número maior." },
          { form: "trocou", meaning: "you exchanged", pron: "troh-KOH", example: "Você trocou o produto na loja?" },
          { form: "trocamos", meaning: "we exchanged", pron: "troh-KAH-moosh", example: "Nós trocamos os presentes ontem." },
          { form: "trocaram", meaning: "you all exchanged", pron: "troh-KAH-rahng", example: "Vocês trocaram o carro?" },
        ],
        imperfeito: [
          { form: "trocava", meaning: "I used to exchange / was exchanging", pron: "troh-KAH-vah", example: "Eu trocava figurinhas na escola." },
          { form: "trocava", meaning: "you used to exchange / were exchanging", pron: "troh-KAH-vah", example: "Você trocava de roupa antes de sair?" },
          { form: "trocávamos", meaning: "we used to exchange / were exchanging", pron: "troh-KAH-vah-moosh", example: "Nós trocávamos cartas toda semana." },
          { form: "trocavam", meaning: "you all used to exchange / were exchanging", pron: "troh-KAH-vahng", example: "Vocês trocavam presentes sempre?" },
        ],
      },
    },
    {
      pt: "escolher", en: "to choose", category: "Consumo e serviços",
      tenses: {
        presente: [
          { form: "escolho", meaning: "I choose", pron: "ehsh-KOH-lyoo", example: "Eu escolho o prato mais barato." },
          { form: "escolhe", meaning: "you choose", pron: "ehsh-KOH-lyee", example: "Você escolhe o vinho?" },
          { form: "escolhemos", meaning: "we choose", pron: "ehsh-koh-LYEH-moosh", example: "Nós escolhemos o filme juntos." },
          { form: "escolhem", meaning: "you all choose", pron: "ehsh-KOH-lyeng", example: "Vocês escolhem a sobremesa?" },
        ],
        perfeito: [
          { form: "escolhi", meaning: "I chose", pron: "ehsh-koh-LYEE", example: "Eu escolhi a camisa azul." },
          { form: "escolheu", meaning: "you chose", pron: "ehsh-koh-LYEH-oo", example: "Você escolheu o restaurante?" },
          { form: "escolhemos", meaning: "we chose", pron: "ehsh-koh-LYEH-moosh", example: "Nós escolhemos o hotel ontem." },
          { form: "escolheram", meaning: "you all chose", pron: "ehsh-koh-LYEH-rahng", example: "Vocês escolheram o horário?" },
        ],
        imperfeito: [
          { form: "escolhia", meaning: "I used to choose / was choosing", pron: "ehsh-koh-LYEE-ah", example: "Eu escolhia sempre a mesma coisa." },
          { form: "escolhia", meaning: "you used to choose / were choosing", pron: "ehsh-koh-LYEE-ah", example: "Você escolhia a roupa antes de sair?" },
          { form: "escolhíamos", meaning: "we used to choose / were choosing", pron: "ehsh-koh-LYEE-ah-moosh", example: "Nós escolhíamos o filme na hora." },
          { form: "escolhiam", meaning: "you all used to choose / were choosing", pron: "ehsh-koh-LYEE-ahng", example: "Vocês escolhiam juntos?" },
        ],
      },
    },
    {
      pt: "procurar", en: "to look for", category: "Consumo e serviços",
      tenses: {
        presente: [
          { form: "procuro", meaning: "I look for", pron: "proh-KOO-roo", example: "Eu procuro as minhas chaves." },
          { form: "procura", meaning: "you look for", pron: "proh-KOO-rah", example: "Você procura emprego?" },
          { form: "procuramos", meaning: "we look for", pron: "proh-koo-RAH-moosh", example: "Nós procuramos um apartamento maior." },
          { form: "procuram", meaning: "you all look for", pron: "proh-KOO-rahng", example: "Vocês procuram alguma coisa?" },
        ],
        perfeito: [
          { form: "procurei", meaning: "I looked for", pron: "proh-koo-RAY", example: "Eu procurei o celular por toda parte." },
          { form: "procurou", meaning: "you looked for", pron: "proh-koo-ROH", example: "Você procurou no armário?" },
          { form: "procuramos", meaning: "we looked for", pron: "proh-koo-RAH-moosh", example: "Nós procuramos a rua no mapa." },
          { form: "procuraram", meaning: "you all looked for", pron: "proh-koo-RAH-rahng", example: "Vocês procuraram por mim?" },
        ],
        imperfeito: [
          { form: "procurava", meaning: "I used to look for / was looking for", pron: "proh-koo-RAH-vah", example: "Eu procurava sempre o caminho mais curto." },
          { form: "procurava", meaning: "you used to look for / were looking for", pron: "proh-koo-RAH-vah", example: "Você procurava emprego naquela época?" },
          { form: "procurávamos", meaning: "we used to look for / were looking for", pron: "proh-koo-RAH-vah-moosh", example: "Nós procurávamos casa perto do centro." },
          { form: "procuravam", meaning: "you all used to look for / were looking for", pron: "proh-koo-RAH-vahng", example: "Vocês procuravam por ele?" },
        ],
      },
    },
    {
      pt: "comer", en: "to eat", category: "Rotina e lazer",
      tenses: {
        presente: [
          { form: "como", meaning: "I eat", pron: "KOH-moo", example: "Eu como arroz." },
          { form: "come", meaning: "you eat", pron: "KOH-mee", example: "Você come carne?" },
          { form: "comemos", meaning: "we eat", pron: "koh-MEH-moosh", example: "Nós comemos cedo." },
          { form: "comem", meaning: "you all eat", pron: "KOH-meng", example: "Vocês comem aqui?" },
        ],
        perfeito: [
          { form: "comi", meaning: "I ate", pron: "koh-MEE", example: "Eu comi pão de queijo hoje cedo." },
          { form: "comeu", meaning: "you ate", pron: "koh-MEH-oo", example: "Você comeu no restaurante ontem?" },
          { form: "comemos", meaning: "we ate", pron: "koh-MEH-moosh", example: "Nós comemos na feira ontem." },
          { form: "comeram", meaning: "you all ate", pron: "koh-MEH-rahng", example: "Vocês comeram depois do trabalho?" },
        ],
        imperfeito: [
          { form: "comia", meaning: "I used to eat / was eating", pron: "koh-MEE-ah", example: "Eu comia feijão todo dia." },
          { form: "comia", meaning: "you used to eat / were eating", pron: "koh-MEE-ah", example: "Você comia muito doce?" },
          { form: "comíamos", meaning: "we used to eat / were eating", pron: "koh-MEE-ah-moosh", example: "Nós comíamos na casa da vó aos domingos." },
          { form: "comiam", meaning: "you all used to eat / were eating", pron: "koh-MEE-ahng", example: "Vocês comiam juntos no intervalo?" },
        ],
      },
    },
    {
      pt: "beber", en: "to drink", category: "Rotina e lazer",
      tenses: {
        presente: [
          { form: "bebo", meaning: "I drink", pron: "BEH-boo", example: "Eu bebo suco." },
          { form: "bebe", meaning: "you drink", pron: "BEH-bee", example: "Você bebe café?" },
          { form: "bebemos", meaning: "we drink", pron: "beh-BEH-moosh", example: "Nós bebemos muita água." },
          { form: "bebem", meaning: "you all drink", pron: "BEH-beng", example: "Vocês bebem chá?" },
        ],
        perfeito: [
          { form: "bebi", meaning: "I drank", pron: "beh-BEE", example: "Eu bebi muita água depois da corrida." },
          { form: "bebeu", meaning: "you drank", pron: "beh-BEH-oo", example: "Você bebeu café hoje cedo?" },
          { form: "bebemos", meaning: "we drank", pron: "beh-BEH-moosh", example: "Nós bebemos vinho no jantar." },
          { form: "beberam", meaning: "you all drank", pron: "beh-BEH-rahng", example: "Vocês beberam suco ou água?" },
        ],
        imperfeito: [
          { form: "bebia", meaning: "I used to drink / was drinking", pron: "beh-BEE-ah", example: "Eu bebia leite todo dia de manhã." },
          { form: "bebia", meaning: "you used to drink / were drinking", pron: "beh-BEE-ah", example: "Você bebia café quando era adolescente?" },
          { form: "bebíamos", meaning: "we used to drink / were drinking", pron: "beh-BEE-ah-moosh", example: "Nós bebíamos suco natural em casa." },
          { form: "bebiam", meaning: "you all used to drink / were drinking", pron: "beh-BEE-ahng", example: "Vocês bebiam água durante o treino?" },
        ],
      },
    },
    {
      pt: "tomar", en: "to take (a shower, a coffee, medicine)", category: "Rotina e lazer",
      tenses: {
        presente: [
          { form: "tomo", meaning: "I take (a shower, a coffee)", pron: "TOH-moo", example: "Eu tomo café sem açúcar." },
          { form: "toma", meaning: "you take (a shower, a coffee)", pron: "TOH-mah", example: "Você toma banho de manhã ou de noite?" },
          { form: "tomamos", meaning: "we take (a shower, a coffee)", pron: "toh-MAH-moosh", example: "Nós tomamos uma cerveja depois do trabalho." },
          { form: "tomam", meaning: "you all take (a shower, a coffee)", pron: "TOH-mahng", example: "Vocês tomam café da manhã em casa?" },
        ],
        perfeito: [
          { form: "tomei", meaning: "I took (a shower, a coffee)", pron: "toh-MAY", example: "Eu tomei um remédio pra dor de cabeça." },
          { form: "tomou", meaning: "you took (a shower, a coffee)", pron: "toh-MOH", example: "Você já tomou café?" },
          { form: "tomamos", meaning: "we took (a shower, a coffee)", pron: "toh-MAH-moosh", example: "Nós tomamos um açaí na praia." },
          { form: "tomaram", meaning: "you all took (a shower, a coffee)", pron: "toh-MAH-rahng", example: "Vocês tomaram sol demais hoje." },
        ],
        imperfeito: [
          { form: "tomava", meaning: "I used to take (a shower, a coffee)", pron: "toh-MAH-vah", example: "Eu tomava banho de mar todo dia." },
          { form: "tomava", meaning: "you used to take (a shower, a coffee)", pron: "toh-MAH-vah", example: "Você tomava café quando era criança?" },
          { form: "tomávamos", meaning: "we used to take (a shower, a coffee)", pron: "toh-MAH-vah-moosh", example: "Nós tomávamos suco de laranja toda manhã." },
          { form: "tomavam", meaning: "you all used to take (a shower, a coffee)", pron: "toh-MAH-vahng", example: "Vocês tomavam ônibus pra escola?" },
        ],
      },
    },
    {
      pt: "cozinhar", en: "to cook", category: "Rotina e lazer",
      tenses: {
        presente: [
          { form: "cozinho", meaning: "I cook", pron: "koh-ZEEN-yoo", example: "Eu cozinho em casa toda semana." },
          { form: "cozinha", meaning: "you cook", pron: "koh-ZEEN-yah", example: "Você cozinha ou pede comida?" },
          { form: "cozinhamos", meaning: "we cook", pron: "koh-zeen-YAH-moosh", example: "Nós cozinhamos pra família no domingo." },
          { form: "cozinham", meaning: "you all cook", pron: "koh-ZEEN-yahng", example: "Vocês cozinham juntos?" },
        ],
        perfeito: [
          { form: "cozinhei", meaning: "I cooked", pron: "koh-zee-NYAY", example: "Eu cozinhei macarrão para o jantar." },
          { form: "cozinhou", meaning: "you cooked", pron: "koh-zee-NYOH", example: "Você cozinhou hoje?" },
          { form: "cozinhamos", meaning: "we cooked", pron: "koh-zee-NYAH-moosh", example: "Nós cozinhamos juntos no fim de semana." },
          { form: "cozinharam", meaning: "you all cooked", pron: "koh-zee-NYAH-rahng", example: "Vocês cozinharam algo diferente?" },
        ],
        imperfeito: [
          { form: "cozinhava", meaning: "I used to cook / was cooking", pron: "koh-zeen-YAH-vah", example: "Eu cozinhava para a família inteira." },
          { form: "cozinhava", meaning: "you used to cook / were cooking", pron: "koh-zeen-YAH-vah", example: "Você cozinhava em casa todo dia?" },
          { form: "cozinhávamos", meaning: "we used to cook / were cooking", pron: "koh-zeen-YAH-vah-moosh", example: "Nós cozinhávamos juntos nos fins de semana." },
          { form: "cozinhavam", meaning: "you all used to cook", pron: "koh-zeen-YAH-vahng", example: "Vocês cozinhavam a própria comida?" },
        ],
      },
    },
    {
      pt: "almoçar", en: "to have lunch", category: "Rotina e lazer",
      tenses: {
        presente: [
          { form: "almoço", meaning: "I have lunch", pron: "ahl-MOH-soo", example: "Eu almoço meio-dia em ponto." },
          { form: "almoça", meaning: "you have lunch", pron: "ahl-MOH-sah", example: "Você almoça em casa ou na rua?" },
          { form: "almoçamos", meaning: "we have lunch", pron: "ahl-moh-SAH-moosh", example: "Nós almoçamos juntos toda sexta." },
          { form: "almoçam", meaning: "you all have lunch", pron: "ahl-MOH-sahng", example: "Vocês almoçam no quilo perto do trabalho?" },
        ],
        perfeito: [
          { form: "almocei", meaning: "I had lunch", pron: "ahl-moh-SAY", example: "Eu almocei tarde hoje." },
          { form: "almoçou", meaning: "you had lunch", pron: "ahl-moh-SOH", example: "Você já almoçou?" },
          { form: "almoçamos", meaning: "we had lunch", pron: "ahl-moh-SAH-moosh", example: "Nós almoçamos naquele quilo novo." },
          { form: "almoçaram", meaning: "you all had lunch", pron: "ahl-moh-SAH-rahng", example: "Vocês almoçaram onde?" },
        ],
        imperfeito: [
          { form: "almoçava", meaning: "I used to have lunch", pron: "ahl-moh-SAH-vah", example: "Eu almoçava na casa da minha avó." },
          { form: "almoçava", meaning: "you used to have lunch", pron: "ahl-moh-SAH-vah", example: "Você almoçava na escola?" },
          { form: "almoçávamos", meaning: "we used to have lunch", pron: "ahl-moh-SAH-vah-moosh", example: "Nós almoçávamos todos juntos no domingo." },
          { form: "almoçavam", meaning: "you all used to have lunch", pron: "ahl-moh-SAH-vahng", example: "Vocês almoçavam no trabalho?" },
        ],
      },
    },
    {
      pt: "jantar", en: "to have dinner", category: "Rotina e lazer",
      tenses: {
        presente: [
          { form: "janto", meaning: "I have dinner", pron: "ZHAHN-too", example: "Eu janto cedo durante a semana." },
          { form: "janta", meaning: "you have dinner", pron: "ZHAHN-tah", example: "Você janta fora muito?" },
          { form: "jantamos", meaning: "we have dinner", pron: "zhahn-TAH-moosh", example: "Nós jantamos às oito." },
          { form: "jantam", meaning: "you all have dinner", pron: "ZHAHN-tahng", example: "Vocês jantam juntos todo dia?" },
        ],
        perfeito: [
          { form: "jantei", meaning: "I had dinner", pron: "zhahn-TAY", example: "Eu jantei uma pizza ontem." },
          { form: "jantou", meaning: "you had dinner", pron: "zhahn-TOH", example: "Você já jantou?" },
          { form: "jantamos", meaning: "we had dinner", pron: "zhahn-TAH-moosh", example: "Nós jantamos num japonês em Ipanema." },
          { form: "jantaram", meaning: "you all had dinner", pron: "zhahn-TAH-rahng", example: "Vocês jantaram bem?" },
        ],
        imperfeito: [
          { form: "jantava", meaning: "I used to have dinner", pron: "zhahn-TAH-vah", example: "Eu jantava vendo novela." },
          { form: "jantava", meaning: "you used to have dinner", pron: "zhahn-TAH-vah", example: "Você jantava tarde quando morava na Espanha?" },
          { form: "jantávamos", meaning: "we used to have dinner", pron: "zhahn-TAH-vah-moosh", example: "Nós jantávamos na varanda no verão." },
          { form: "jantavam", meaning: "you all used to have dinner", pron: "zhahn-TAH-vahng", example: "Vocês jantavam com os avós no domingo?" },
        ],
      },
    },
    {
      pt: "assistir", en: "to watch", category: "Rotina e lazer",
      tenses: {
        presente: [
          { form: "assisto", meaning: "I watch", pron: "ah-SEES-too", example: "Eu assisto televisão." },
          { form: "assiste", meaning: "you watch", pron: "ah-SEES-chee", example: "Você assiste futebol?" },
          { form: "assistimos", meaning: "we watch", pron: "ah-sees-CHEE-moosh", example: "Nós assistimos ao filme." },
          { form: "assistem", meaning: "you all watch", pron: "ah-SEES-teng", example: "Vocês assistem à novela?" },
        ],
        perfeito: [
          { form: "assisti", meaning: "I watched", pron: "ah-sees-CHEE", example: "Eu assisti ao filme ontem à noite." },
          { form: "assistiu", meaning: "you watched", pron: "ah-sees-CHEE-oo", example: "Você assistiu ao jogo?" },
          { form: "assistimos", meaning: "we watched", pron: "ah-sees-CHEE-moosh", example: "Nós assistimos à série no fim de semana." },
          { form: "assistiram", meaning: "you all watched", pron: "ah-sees-CHEE-rahng", example: "Vocês assistiram à aula toda?" },
        ],
        imperfeito: [
          { form: "assistia", meaning: "I used to watch / attend", pron: "ah-sees-CHEE-ah", example: "Eu assistia desenho todo dia depois da escola." },
          { form: "assistia", meaning: "you used to watch / attend", pron: "ah-sees-CHEE-ah", example: "Você assistia novela com a sua mãe?" },
          { form: "assistíamos", meaning: "we used to watch / attend", pron: "ah-sees-CHEE-ah-moosh", example: "Nós assistíamos filme no sábado à noite." },
          { form: "assistiam", meaning: "you all used to watch / attend", pron: "ah-sees-CHEE-ahng", example: "Vocês assistiam futebol na TV?" },
        ],
      },
    },
    {
      pt: "escutar", en: "to listen", category: "Rotina e lazer",
      tenses: {
        presente: [
          { form: "escuto", meaning: "I listen", pron: "ehsh-KOO-too", example: "Eu escuto música no ônibus." },
          { form: "escuta", meaning: "you listen", pron: "ehsh-KOO-tah", example: "Você escuta rádio?" },
          { form: "escutamos", meaning: "we listen", pron: "ehsh-koo-TAH-moosh", example: "Nós escutamos os vizinhos conversando." },
          { form: "escutam", meaning: "you all listen", pron: "ehsh-KOO-tahng", example: "Vocês escutam esse podcast?" },
        ],
        perfeito: [
          { form: "escutei", meaning: "I listened", pron: "ehsh-koo-TAY", example: "Eu escutei a música nova ontem." },
          { form: "escutou", meaning: "you listened", pron: "ehsh-koo-TOH", example: "Você escutou o que ele falou?" },
          { form: "escutamos", meaning: "we listened", pron: "ehsh-koo-TAH-moosh", example: "Nós escutamos o show inteiro." },
          { form: "escutaram", meaning: "you all listened", pron: "ehsh-koo-TAH-rahng", example: "Vocês escutaram o barulho?" },
        ],
        imperfeito: [
          { form: "escutava", meaning: "I used to listen / was listening", pron: "ehsh-koo-TAH-vah", example: "Eu escutava rádio todo dia no carro." },
          { form: "escutava", meaning: "you used to listen / were listening", pron: "ehsh-koo-TAH-vah", example: "Você escutava música alta?" },
          { form: "escutávamos", meaning: "we used to listen / were listening", pron: "ehsh-koo-TAH-vah-moosh", example: "Nós escutávamos os discos do meu pai." },
          { form: "escutavam", meaning: "you all used to listen / were listening", pron: "ehsh-koo-TAH-vahng", example: "Vocês escutavam essa banda?" },
        ],
      },
    },
    {
      pt: "dançar", en: "to dance", category: "Rotina e lazer",
      tenses: {
        presente: [
          { form: "danço", meaning: "I dance", pron: "DAHN-soo", example: "Eu danço forró." },
          { form: "dança", meaning: "you dance", pron: "DAHN-sah", example: "Você dança samba?" },
          { form: "dançamos", meaning: "we dance", pron: "dahn-SAH-moosh", example: "Nós dançamos até tarde." },
          { form: "dançam", meaning: "you all dance", pron: "DAHN-sahng", example: "Vocês dançam bem?" },
        ],
        perfeito: [
          { form: "dancei", meaning: "I danced", pron: "dahn-SAY", example: "Eu dancei muito na festa." },
          { form: "dançou", meaning: "you danced", pron: "dahn-SOH", example: "Você dançou com ele?" },
          { form: "dançamos", meaning: "we danced", pron: "dahn-SAH-moosh", example: "Nós dançamos a noite toda." },
          { form: "dançaram", meaning: "you all danced", pron: "dahn-SAH-rahng", example: "Vocês dançaram no baile?" },
        ],
        imperfeito: [
          { form: "dançava", meaning: "I used to dance / was dancing", pron: "dahn-SAH-vah", example: "Eu dançava samba quando era mais novo." },
          { form: "dançava", meaning: "you used to dance / were dancing", pron: "dahn-SAH-vah", example: "Você dançava no carnaval?" },
          { form: "dançávamos", meaning: "we used to dance / were dancing", pron: "dahn-SAH-vah-moosh", example: "Nós dançávamos toda sexta." },
          { form: "dançavam", meaning: "you all used to dance / were dancing", pron: "dahn-SAH-vahng", example: "Vocês dançavam juntos?" },
        ],
      },
    },
    {
      pt: "viajar", en: "to travel", category: "Rotina e lazer",
      tenses: {
        presente: [
          { form: "viajo", meaning: "I travel", pron: "vee-AH-zhoo", example: "Eu viajo muito a trabalho." },
          { form: "viaja", meaning: "you travel", pron: "vee-AH-zhah", example: "Você viaja com frequência?" },
          { form: "viajamos", meaning: "we travel", pron: "vee-ah-ZHAH-moosh", example: "Nós viajamos para o Nordeste todo ano." },
          { form: "viajam", meaning: "you all travel", pron: "vee-AH-zhahng", example: "Vocês viajam juntos?" },
        ],
        perfeito: [
          { form: "viajei", meaning: "I traveled", pron: "vee-ah-ZHAY", example: "Eu viajei para São Paulo no mês passado." },
          { form: "viajou", meaning: "you traveled", pron: "vee-ah-ZHOH", example: "Você viajou de avião?" },
          { form: "viajamos", meaning: "we traveled", pron: "vee-ah-ZHAH-moosh", example: "Nós viajamos nas férias." },
          { form: "viajaram", meaning: "you all traveled", pron: "vee-ah-ZHAH-rahng", example: "Vocês viajaram juntos?" },
        ],
        imperfeito: [
          { form: "viajava", meaning: "I used to travel / was traveling", pron: "vee-ah-ZHAH-vah", example: "Eu viajava de avião com a minha família." },
          { form: "viajava", meaning: "you used to travel / were traveling", pron: "vee-ah-ZHAH-vah", example: "Você viajava nas férias escolares?" },
          { form: "viajávamos", meaning: "we used to travel / were traveling", pron: "vee-ah-ZHAH-vah-moosh", example: "Nós viajávamos para o interior todo ano." },
          { form: "viajavam", meaning: "you all used to travel / were traveling", pron: "vee-ah-ZHAH-vahng", example: "Vocês viajavam de carro?" },
        ],
      },
    },
    {
      pt: "descansar", en: "to rest", category: "Rotina e lazer",
      tenses: {
        presente: [
          { form: "descanso", meaning: "I rest", pron: "dehsh-KAHN-soo", example: "Eu descanso no domingo." },
          { form: "descansa", meaning: "you rest", pron: "dehsh-KAHN-sah", example: "Você descansa depois do almoço?" },
          { form: "descansamos", meaning: "we rest", pron: "dehsh-kahn-SAH-moosh", example: "Nós descansamos um pouco à tarde." },
          { form: "descansam", meaning: "you all rest", pron: "dehsh-KAHN-sahng", example: "Vocês descansam no fim de semana?" },
        ],
        perfeito: [
          { form: "descansei", meaning: "I rested", pron: "dehsh-kahn-SAY", example: "Eu descansei bastante ontem." },
          { form: "descansou", meaning: "you rested", pron: "dehsh-kahn-SOH", example: "Você descansou no feriado?" },
          { form: "descansamos", meaning: "we rested", pron: "dehsh-kahn-SAH-moosh", example: "Nós descansamos depois da viagem." },
          { form: "descansaram", meaning: "you all rested", pron: "dehsh-kahn-SAH-rahng", example: "Vocês descansaram um pouco?" },
        ],
        imperfeito: [
          { form: "descansava", meaning: "I used to rest / was resting", pron: "dehsh-kahn-SAH-vah", example: "Eu descansava todo domingo de manhã." },
          { form: "descansava", meaning: "you used to rest / were resting", pron: "dehsh-kahn-SAH-vah", example: "Você descansava depois da aula?" },
          { form: "descansávamos", meaning: "we used to rest / were resting", pron: "dehsh-kahn-SAH-vah-moosh", example: "Nós descansávamos na rede à tarde." },
          { form: "descansavam", meaning: "you all used to rest / were resting", pron: "dehsh-kahn-SAH-vahng", example: "Vocês descansavam nas férias?" },
        ],
      },
    },
    {
      pt: "praticar", en: "to practice", category: "Rotina e lazer",
      tenses: {
        presente: [
          { form: "pratico", meaning: "I practice", pron: "prah-CHEE-koo", example: "Eu pratico português todo dia." },
          { form: "pratica", meaning: "you practice", pron: "prah-CHEE-kah", example: "Você pratica algum esporte?" },
          { form: "praticamos", meaning: "we practice", pron: "prah-chee-KAH-moosh", example: "Nós praticamos juntos duas vezes por semana." },
          { form: "praticam", meaning: "you all practice", pron: "prah-CHEE-kahng", example: "Vocês praticam inglês no trabalho?" },
        ],
        perfeito: [
          { form: "pratiquei", meaning: "I practiced", pron: "prah-chee-KAY", example: "Eu pratiquei bastante antes da prova." },
          { form: "praticou", meaning: "you practiced", pron: "prah-chee-KOH", example: "Você praticou hoje?" },
          { form: "praticamos", meaning: "we practiced", pron: "prah-chee-KAH-moosh", example: "Nós praticamos a apresentação ontem." },
          { form: "praticaram", meaning: "you all practiced", pron: "prah-chee-KAH-rahng", example: "Vocês praticaram no fim de semana?" },
        ],
        imperfeito: [
          { form: "praticava", meaning: "I used to practice / was practicing", pron: "prah-chee-KAH-vah", example: "Eu praticava violão todo dia." },
          { form: "praticava", meaning: "you used to practice / were practicing", pron: "prah-chee-KAH-vah", example: "Você praticava natação quando criança?" },
          { form: "praticávamos", meaning: "we used to practice / were practicing", pron: "prah-chee-KAH-vah-moosh", example: "Nós praticávamos futebol na rua." },
          { form: "praticavam", meaning: "you all used to practice / were practicing", pron: "prah-chee-KAH-vahng", example: "Vocês praticavam juntos antes?" },
        ],
      },
    },
    {
      pt: "treinar", en: "to train", category: "Rotina e lazer",
      tenses: {
        presente: [
          { form: "treino", meaning: "I train", pron: "TRAY-noo", example: "Eu treino na academia." },
          { form: "treina", meaning: "you train", pron: "TRAY-nah", example: "Você treina de manhã?" },
          { form: "treinamos", meaning: "we train", pron: "tray-NAH-moosh", example: "Nós treinamos três vezes por semana." },
          { form: "treinam", meaning: "you all train", pron: "TRAY-nahng", example: "Vocês treinam juntos?" },
        ],
        perfeito: [
          { form: "treinei", meaning: "I trained", pron: "tray-NAY", example: "Eu treinei bastante ontem." },
          { form: "treinou", meaning: "you trained", pron: "tray-NOH", example: "Você treinou hoje?" },
          { form: "treinamos", meaning: "we trained", pron: "tray-NAH-moosh", example: "Nós treinamos pro jogo de sábado." },
          { form: "treinaram", meaning: "you all trained", pron: "tray-NAH-rahng", example: "Vocês treinaram na praia?" },
        ],
        imperfeito: [
          { form: "treinava", meaning: "I used to train / was training", pron: "tray-NAH-vah", example: "Eu treinava todo dia antes do trabalho." },
          { form: "treinava", meaning: "you used to train / were training", pron: "tray-NAH-vah", example: "Você treinava futebol na escola?" },
          { form: "treinávamos", meaning: "we used to train / were training", pron: "tray-NAH-vah-moosh", example: "Nós treinávamos no campo do bairro." },
          { form: "treinavam", meaning: "you all used to train / were training", pron: "tray-NAH-vahng", example: "Vocês treinavam muito antes?" },
        ],
      },
    },
    {
      pt: "curtir", en: "to enjoy", category: "Rotina e lazer",
      tenses: {
        presente: [
          { form: "curto", meaning: "I enjoy / like", pron: "KOOR-too", example: "Eu curto essa música." },
          { form: "curte", meaning: "you enjoy / like", pron: "KOOR-chee", example: "Você curte praia?" },
          { form: "curtimos", meaning: "we enjoy / like", pron: "koor-CHEE-moosh", example: "Nós curtimos o fim de semana na praia." },
          { form: "curtem", meaning: "you all enjoy / like", pron: "KOOR-teng", example: "Vocês curtem viajar?" },
        ],
        perfeito: [
          { form: "curti", meaning: "I enjoyed", pron: "koor-CHEE", example: "Eu curti a festa ontem." },
          { form: "curtiu", meaning: "you enjoyed", pron: "koor-CHEE-oo", example: "Você curtiu o show?" },
          { form: "curtimos", meaning: "we enjoyed", pron: "koor-CHEE-moosh", example: "Nós curtimos o fim de semana na praia." },
          { form: "curtiram", meaning: "you all enjoyed", pron: "koor-CHEE-rahng", example: "Vocês curtiram a viagem?" },
        ],
        imperfeito: [
          { form: "curtia", meaning: "I used to enjoy / like (slang)", pron: "koor-CHEE-ah", example: "Eu curtia ficar na praia o dia todo." },
          { form: "curtia", meaning: "you used to enjoy / like (slang)", pron: "koor-CHEE-ah", example: "Você curtia festa com os amigos?" },
          { form: "curtíamos", meaning: "we used to enjoy / like (slang)", pron: "koor-CHEE-ah-moosh", example: "Nós curtíamos aquele bar na Lapa." },
          { form: "curtiam", meaning: "you all used to enjoy / like (slang)", pron: "koor-CHEE-ahng", example: "Vocês curtiam viajar nas férias?" },
        ],
      },
    },
    {
      pt: "aproveitar", en: "to make the most of, to take advantage of", category: "Rotina e lazer",
      tenses: {
        presente: [
          { form: "aproveito", meaning: "I make the most of", pron: "ah-proh-VAY-too", example: "Eu aproveito o sol sempre que dá." },
          { form: "aproveita", meaning: "you make the most of", pron: "ah-proh-VAY-tah", example: "Você aproveita bem o fim de semana?" },
          { form: "aproveitamos", meaning: "we make the most of", pron: "ah-proh-vay-TAH-moosh", example: "Nós aproveitamos cada dia de férias." },
          { form: "aproveitam", meaning: "you all make the most of", pron: "ah-proh-VAY-tahng", example: "Vocês aproveitam a praia de manhã?" },
        ],
        perfeito: [
          { form: "aproveitei", meaning: "I made the most of", pron: "ah-proh-vay-TAY", example: "Eu aproveitei muito a viagem." },
          { form: "aproveitou", meaning: "you made the most of", pron: "ah-proh-vay-TOH", example: "Você aproveitou a promoção?" },
          { form: "aproveitamos", meaning: "we made the most of", pron: "ah-proh-vay-TAH-moosh", example: "Nós aproveitamos o feriado na praia." },
          { form: "aproveitaram", meaning: "you all made the most of", pron: "ah-proh-vay-TAH-rahng", example: "Vocês aproveitaram o show?" },
        ],
        imperfeito: [
          { form: "aproveitava", meaning: "I used to make the most of", pron: "ah-proh-vay-TAH-vah", example: "Eu aproveitava cada segundo de férias." },
          { form: "aproveitava", meaning: "you used to make the most of", pron: "ah-proh-vay-TAH-vah", example: "Você aproveitava as férias na praia?" },
          { form: "aproveitávamos", meaning: "we used to make the most of", pron: "ah-proh-vay-TAH-vah-moosh", example: "Nós aproveitávamos o verão inteiro na praia." },
          { form: "aproveitavam", meaning: "you all used to make the most of", pron: "ah-proh-vay-TAH-vahng", example: "Vocês aproveitavam o feriado pra viajar?" },
        ],
      },
    },
    {
      pt: "frequentar", en: "to attend, to go regularly", category: "Rotina e lazer",
      tenses: {
        presente: [
          { form: "frequento", meaning: "I attend / go to often", pron: "freh-KWEN-too", example: "Eu frequento a academia três vezes por semana." },
          { form: "frequenta", meaning: "you attend / go to often", pron: "freh-KWEN-tah", example: "Você frequenta a mesma padaria?" },
          { form: "frequentamos", meaning: "we attend / go to often", pron: "freh-kwen-TAH-moosh", example: "Nós frequentamos esse restaurante." },
          { form: "frequentam", meaning: "you all attend / go to often", pron: "freh-KWEN-tahng", example: "Vocês frequentam a aula de português?" },
        ],
        perfeito: [
          { form: "frequentei", meaning: "I attended / frequented", pron: "freh-kwen-TAY", example: "Eu frequentei aquela academia no ano passado." },
          { form: "frequentou", meaning: "you attended / frequented", pron: "freh-kwen-TOH", example: "Você frequentou as aulas todas?" },
          { form: "frequentamos", meaning: "we attended / frequented", pron: "freh-kwen-TAH-moosh", example: "Nós frequentamos o mesmo bar." },
          { form: "frequentaram", meaning: "you all attended / frequented", pron: "freh-kwen-TAH-rahng", example: "Vocês frequentaram a escola juntos?" },
        ],
        imperfeito: [
          { form: "frequentava", meaning: "I used to frequent / would go to", pron: "freh-kwen-TAH-vah", example: "Quando era criança, eu frequentava aquela praia toda semana." },
          { form: "frequentava", meaning: "you used to frequent / would go to", pron: "freh-kwen-TAH-vah", example: "Você frequentava muito a casa dela?" },
          { form: "frequentávamos", meaning: "we used to frequent / would go to", pron: "freh-kwen-TAH-vah-moosh", example: "Nós frequentávamos o mesmo bar todo sábado." },
          { form: "frequentavam", meaning: "you all used to frequent / would go to", pron: "freh-kwen-TAH-vahng", example: "Vocês frequentavam aquele restaurante antes?" },
        ],
      },
    },
    {
      pt: "jogar", en: "to play (sports), to throw", category: "Rotina e lazer",
      tenses: {
        presente: [
          { form: "jogo", meaning: "I play (sport / game)", pron: "ZHOH-goo", example: "Eu jogo futebol no fim de semana." },
          { form: "joga", meaning: "you play (sport / game)", pron: "ZHOH-gah", example: "Você joga vôlei na praia?" },
          { form: "jogamos", meaning: "we play (sport / game)", pron: "zhoh-GAH-moosh", example: "Nós jogamos futebol toda semana." },
          { form: "jogam", meaning: "you all play (sport / game)", pron: "ZHOH-gahng", example: "Vocês jogam no mesmo time?" },
        ],
        perfeito: [
          { form: "joguei", meaning: "I played", pron: "zhoh-GAY", example: "Eu joguei futebol ontem." },
          { form: "jogou", meaning: "you played", pron: "zhoh-GOH", example: "Você jogou videogame a noite toda?" },
          { form: "jogamos", meaning: "we played", pron: "zhoh-GAH-moosh", example: "Nós jogamos cartas no sábado." },
          { form: "jogaram", meaning: "you all played", pron: "zhoh-GAH-rahng", example: "Vocês jogaram no parque?" },
        ],
        imperfeito: [
          { form: "jogava", meaning: "I used to play / was playing", pron: "zho-GAH-vah", example: "Eu jogava bola na rua todo dia." },
          { form: "jogava", meaning: "you used to play / were playing", pron: "zho-GAH-vah", example: "Você jogava videogame depois da escola?" },
          { form: "jogávamos", meaning: "we used to play / were playing", pron: "zho-GAH-vah-moosh", example: "Nós jogávamos cartas na varanda." },
          { form: "jogavam", meaning: "you all used to play / were playing", pron: "zho-GAH-vahng", example: "Vocês jogavam futebol no sábado?" },
        ],
      },
    },
    {
      pt: "brincar", en: "to play (kids), to joke", category: "Rotina e lazer",
      tenses: {
        presente: [
          { form: "brinco", meaning: "I play (kids) / joke", pron: "BREEN-koo", example: "Eu brinco com meus sobrinhos no domingo." },
          { form: "brinca", meaning: "you play (kids) / joke", pron: "BREEN-kah", example: "Você brinca muito, né?" },
          { form: "brincamos", meaning: "we play (kids) / joke", pron: "breen-KAH-moosh", example: "Nós brincamos de esconde-esconde com as crianças." },
          { form: "brincam", meaning: "you all play (kids) / joke", pron: "BREEN-kahng", example: "Vocês brincam demais com ele." },
        ],
        perfeito: [
          { form: "brinquei", meaning: "I played (kids) / joked", pron: "breen-KAY", example: "Eu brinquei, não fica bravo." },
          { form: "brincou", meaning: "you played (kids) / joked", pron: "breen-KOH", example: "Você brincou com o cachorro hoje?" },
          { form: "brincamos", meaning: "we played (kids) / joked", pron: "breen-KAH-moosh", example: "Nós brincamos na praia a tarde toda." },
          { form: "brincaram", meaning: "you all played (kids) / joked", pron: "breen-KAH-rahng", example: "Vocês brincaram de pique na rua?" },
        ],
        imperfeito: [
          { form: "brincava", meaning: "I used to play (kids) / joke", pron: "breen-KAH-vah", example: "Eu brincava na rua até escurecer." },
          { form: "brincava", meaning: "you used to play (kids) / joke", pron: "breen-KAH-vah", example: "Você brincava de boneca?" },
          { form: "brincávamos", meaning: "we used to play (kids) / joke", pron: "breen-KAH-vah-moosh", example: "Nós brincávamos de bola no quintal." },
          { form: "brincavam", meaning: "you all used to play (kids) / joke", pron: "breen-KAH-vahng", example: "Vocês brincavam juntos na escola?" },
        ],
      },
    },
    {
      pt: "nadar", en: "to swim", category: "Rotina e lazer",
      tenses: {
        presente: [
          { form: "nado", meaning: "I swim", pron: "NAH-doo", example: "Eu nado na praia de manhã." },
          { form: "nada", meaning: "you swim", pron: "NAH-dah", example: "Você nada bem?" },
          { form: "nadamos", meaning: "we swim", pron: "nah-DAH-moosh", example: "Nós nadamos na piscina todo dia." },
          { form: "nadam", meaning: "you all swim", pron: "NAH-dahng", example: "Vocês nadam no mar?" },
        ],
        perfeito: [
          { form: "nadei", meaning: "I swam", pron: "nah-DAY", example: "Eu nadei na piscina ontem." },
          { form: "nadou", meaning: "you swam", pron: "nah-DOH", example: "Você nadou no mar?" },
          { form: "nadamos", meaning: "we swam", pron: "nah-DAH-moosh", example: "Nós nadamos no clube." },
          { form: "nadaram", meaning: "you all swam", pron: "nah-DAH-rahng", example: "Vocês nadaram de manhã?" },
        ],
        imperfeito: [
          { form: "nadava", meaning: "I used to swim / was swimming", pron: "nah-DAH-vah", example: "Eu nadava na piscina do clube." },
          { form: "nadava", meaning: "you used to swim / were swimming", pron: "nah-DAH-vah", example: "Você nadava no mar quando era criança?" },
          { form: "nadávamos", meaning: "we used to swim / were swimming", pron: "nah-DAH-vah-moosh", example: "Nós nadávamos todo verão." },
          { form: "nadavam", meaning: "you all used to swim / were swimming", pron: "nah-DAH-vahng", example: "Vocês nadavam na lagoa?" },
        ],
      },
    },
    {
      pt: "passear", en: "to go for a walk, to stroll", category: "Rotina e lazer", irregular: true,
      tenses: {
        presente: [
          { form: "passeio", meaning: "I stroll", pron: "pah-SAY-oo", example: "Eu passeio pelo parque no fim de semana." },
          { form: "passeia", meaning: "you stroll", pron: "pah-SAY-ah", example: "Você passeia com o cachorro todos os dias?" },
          { form: "passeamos", meaning: "we stroll", pron: "pah-say-AH-moosh", example: "Nós passeamos pela orla de tarde." },
          { form: "passeiam", meaning: "you all stroll", pron: "pah-SAY-ahng", example: "Vocês passeiam no Aterro do Flamengo?" },
        ],
        perfeito: [
          { form: "passeei", meaning: "I walked / strolled", pron: "pah-see-AY", example: "Eu passeei com o cachorro de manhã." },
          { form: "passeou", meaning: "you walked / strolled", pron: "pah-see-OH", example: "Você passeou pelo centro histórico?" },
          { form: "passeamos", meaning: "we walked / strolled", pron: "pah-see-AH-moosh", example: "Nós passeamos na beira do rio." },
          { form: "passearam", meaning: "you all walked / strolled", pron: "pah-see-AH-rahng", example: "Vocês passearam no parque hoje?" },
        ],
        imperfeito: [
          { form: "passeava", meaning: "I used to stroll / walk around / was strolling", pron: "pah-see-AH-vah", example: "Eu passeava no parque aos domingos." },
          { form: "passeava", meaning: "you used to stroll / walk around / were strolling", pron: "pah-see-AH-vah", example: "Você passeava com o cachorro todo dia?" },
          { form: "passeávamos", meaning: "we used to stroll / walk around / were strolling", pron: "pah-see-AH-vah-moosh", example: "Nós passeávamos pelo centro aos fins de semana." },
          { form: "passeavam", meaning: "you all used to stroll / walk around", pron: "pah-see-AH-vahng", example: "Vocês passeavam pela praia à tarde?" },
        ],
      },
    },
    {
      pt: "acordar", en: "to wake up", category: "Ações do dia a dia",
      tenses: {
        presente: [
          { form: "acordo", meaning: "I wake up", pron: "ah-KOR-doo", example: "Eu acordo cedo toda semana." },
          { form: "acorda", meaning: "you wake up", pron: "ah-KOR-dah", example: "Você acorda antes das sete?" },
          { form: "acordamos", meaning: "we wake up", pron: "ah-kor-DAH-moosh", example: "Nós acordamos com o barulho da rua." },
          { form: "acordam", meaning: "you all wake up", pron: "ah-KOR-dahng", example: "Vocês acordam cedo no fim de semana?" },
        ],
        perfeito: [
          { form: "acordei", meaning: "I woke up", pron: "ah-kohr-DAY", example: "Eu acordei cedo hoje." },
          { form: "acordou", meaning: "you woke up", pron: "ah-kohr-DOH", example: "Você acordou com o barulho?" },
          { form: "acordamos", meaning: "we woke up", pron: "ah-kohr-DAH-moosh", example: "Nós acordamos antes do alarme." },
          { form: "acordaram", meaning: "you all woke up", pron: "ah-kohr-DAH-rahng", example: "Vocês acordaram na hora?" },
        ],
        imperfeito: [
          { form: "acordava", meaning: "I used to wake up / was waking up", pron: "ah-kohr-DAH-vah", example: "Eu acordava cedo toda manhã." },
          { form: "acordava", meaning: "you used to wake up / were waking up", pron: "ah-kohr-DAH-vah", example: "Você acordava com o barulho?" },
          { form: "acordávamos", meaning: "we used to wake up / were waking up", pron: "ah-kohr-DAH-vah-moosh", example: "Nós acordávamos às seis juntos." },
          { form: "acordavam", meaning: "you all used to wake up", pron: "ah-kohr-DAH-vahng", example: "Vocês acordavam tarde nos fins de semana?" },
        ],
      },
    },
    {
      pt: "dormir", en: "to sleep", category: "Ações do dia a dia", irregular: true,
      tenses: {
        presente: [
          { form: "durmo", meaning: "I sleep", pron: "DOOR-moo", example: "Eu durmo cedo." },
          { form: "dorme", meaning: "you sleep", pron: "DOHR-mee", example: "Você dorme bem?" },
          { form: "dormimos", meaning: "we sleep", pron: "dohr-MEE-moosh", example: "Nós dormimos oito horas." },
          { form: "dormem", meaning: "you all sleep", pron: "DOHR-meng", example: "Vocês dormem tarde?" },
        ],
        perfeito: [
          { form: "dormi", meaning: "I slept", pron: "dohr-MEE", example: "Eu dormi pouco ontem à noite." },
          { form: "dormiu", meaning: "you slept", pron: "dohr-MEE-oo", example: "Você dormiu bem?" },
          { form: "dormimos", meaning: "we slept", pron: "dohr-MEE-moosh", example: "Nós dormimos na casa dela." },
          { form: "dormiram", meaning: "you all slept", pron: "dohr-MEE-rahng", example: "Vocês dormiram até tarde?" },
        ],
        imperfeito: [
          { form: "dormia", meaning: "I used to sleep / was sleeping", pron: "dor-MEE-ah", example: "Eu dormia cedo quando era criança." },
          { form: "dormia", meaning: "you used to sleep / were sleeping", pron: "dor-MEE-ah", example: "Você dormia de tarde nos fins de semana?" },
          { form: "dormíamos", meaning: "we used to sleep / were sleeping", pron: "dor-MEE-ah-moosh", example: "Nós dormíamos na rede na praia." },
          { form: "dormiam", meaning: "you all used to sleep / were sleeping", pron: "dor-MEE-ahng", example: "Vocês dormiam com a luz acesa?" },
        ],
        subjuntivo: [
          { form: "dormisse", meaning: "if I slept", pron: "dohr-MEE-see", example: "Ela queria que eu dormisse mais cedo durante a semana." },
          { form: "dormisse", meaning: "if you slept", pron: "dohr-MEE-see", example: "Se você dormisse oito horas, acordava bem melhor." },
          { form: "dormíssemos", meaning: "if we slept", pron: "dohr-MEE-seh-moosh", example: "Era melhor que nós dormíssemos antes da viagem longa." },
          { form: "dormissem", meaning: "if you all slept", pron: "dohr-MEE-seng", example: "A casa parecia vazia, como se vocês dormissem fora." },
        ],
      },
    },
    {
      pt: "ler", en: "to read", category: "Ações do dia a dia", irregular: true,
      tenses: {
        presente: [
          { form: "leio", meaning: "I read", pron: "LEH-yoo", example: "Eu leio o jornal." },
          { form: "lê", meaning: "you read", pron: "LEH", example: "Você lê em português?" },
          { form: "lemos", meaning: "we read", pron: "LEH-moosh", example: "Nós lemos antes de dormir." },
          { form: "leem", meaning: "you all read", pron: "LEH-eng", example: "Vocês leem muito?" },
        ],
        perfeito: [
          { form: "li", meaning: "I read", pron: "LEE", example: "Eu li o livro todo ontem." },
          { form: "leu", meaning: "you read", pron: "LEH-oo", example: "Você leu o artigo que mandei?" },
          { form: "lemos", meaning: "we read", pron: "LEH-moosh", example: "Nós lemos o mesmo livro na escola." },
          { form: "leram", meaning: "you all read", pron: "LEH-rahng", example: "Vocês leram o e-mail que enviei?" },
        ],
        imperfeito: [
          { form: "lia", meaning: "I used to read / was reading", pron: "LEE-ah", example: "Eu lia antes de dormir todo dia." },
          { form: "lia", meaning: "you used to read / were reading", pron: "LEE-ah", example: "Você lia muito quando era criança?" },
          { form: "líamos", meaning: "we used to read / were reading", pron: "LEE-ah-moosh", example: "Nós líamos o jornal de manhã." },
          { form: "liam", meaning: "you all used to read / were reading", pron: "LEE-ahng", example: "Vocês liam revistas em casa?" },
        ],
      },
    },
    {
      pt: "escrever", en: "to write", category: "Ações do dia a dia",
      tenses: {
        presente: [
          { form: "escrevo", meaning: "I write", pron: "es-KREH-voo", example: "Eu escrevo mensagens em português." },
          { form: "escreve", meaning: "you write", pron: "es-KREH-vee", example: "Você escreve no caderno?" },
          { form: "escrevemos", meaning: "we write", pron: "es-kreh-VEH-moosh", example: "Nós escrevemos e-mails no trabalho." },
          { form: "escrevem", meaning: "you all write", pron: "es-KREH-veng", example: "Vocês escrevem cartas?" },
        ],
        perfeito: [
          { form: "escrevi", meaning: "I wrote", pron: "es-kreh-VEE", example: "Eu escrevi um e-mail para ela." },
          { form: "escreveu", meaning: "you wrote", pron: "es-kreh-VEH-oo", example: "Você escreveu a resposta ontem?" },
          { form: "escrevemos", meaning: "we wrote", pron: "es-kreh-VEH-moosh", example: "Nós escrevemos tudo no caderno." },
          { form: "escreveram", meaning: "you all wrote", pron: "es-kreh-VEH-rahng", example: "Vocês escreveram para o professor?" },
        ],
        imperfeito: [
          { form: "escrevia", meaning: "I used to write / was writing", pron: "es-kreh-VEE-ah", example: "Eu escrevia cartas para a minha avó todo mês." },
          { form: "escrevia", meaning: "you used to write / were writing", pron: "es-kreh-VEE-ah", example: "Você escrevia no diário todo dia?" },
          { form: "escrevíamos", meaning: "we used to write / were writing", pron: "es-kreh-VEE-ah-moosh", example: "Nós escrevíamos as respostas no quadro." },
          { form: "escreviam", meaning: "you all used to write / were writing", pron: "es-kreh-VEE-ahng", example: "Vocês escreviam muito no colégio?" },
        ],
      },
    },
    {
      pt: "ouvir", en: "to hear", category: "Ações do dia a dia", irregular: true,
      tenses: {
        presente: [
          { form: "ouço", meaning: "I hear / listen", pron: "OH-soo", example: "Eu ouço música no carro." },
          { form: "ouve", meaning: "you hear / listen", pron: "OH-vee", example: "Você ouve esse barulho?" },
          { form: "ouvimos", meaning: "we hear / listen", pron: "oh-VEE-moosh", example: "Nós ouvimos o professor com atenção." },
          { form: "ouvem", meaning: "you all hear / listen", pron: "OH-veng", example: "Vocês ouvem podcasts em português?" },
        ],
        perfeito: [
          { form: "ouvi", meaning: "I heard / listened", pron: "oh-VEE", example: "Eu ouvi aquela música ontem." },
          { form: "ouviu", meaning: "you heard / listened", pron: "oh-VEE-oo", example: "Você ouviu o que ela disse?" },
          { form: "ouvimos", meaning: "we heard / listened", pron: "oh-VEE-moosh", example: "Nós ouvimos barulho na rua." },
          { form: "ouviram", meaning: "you all heard / listened", pron: "oh-VEE-rahng", example: "Vocês ouviram o podcast?" },
        ],
        imperfeito: [
          { form: "ouvia", meaning: "I used to hear / listen / was listening", pron: "oh-VEE-ah", example: "Eu ouvia música no rádio todo dia." },
          { form: "ouvia", meaning: "you used to hear / listen / were listening", pron: "oh-VEE-ah", example: "Você ouvia as histórias do seu avô?" },
          { form: "ouvíamos", meaning: "we used to hear / listen / were listening", pron: "oh-VEE-ah-moosh", example: "Nós ouvíamos samba no carro." },
          { form: "ouviam", meaning: "you all used to hear / listen / were listening", pron: "oh-VEE-ahng", example: "Vocês ouviam podcast no trabalho?" },
        ],
      },
    },
    {
      pt: "começar", en: "to start, to begin", category: "Ações do dia a dia",
      tenses: {
        presente: [
          { form: "começo", meaning: "I start / begin", pron: "koh-MEH-soo", example: "Eu começo o trabalho às oito." },
          { form: "começa", meaning: "you start / begin", pron: "koh-MEH-sah", example: "Você começa quando?" },
          { form: "começamos", meaning: "we start / begin", pron: "koh-meh-SAH-moosh", example: "Nós começamos o curso semana que vem." },
          { form: "começam", meaning: "you all start / begin", pron: "koh-MEH-sahng", example: "Vocês começam às nove?" },
        ],
        perfeito: [
          { form: "comecei", meaning: "I started / began", pron: "koh-meh-SAY", example: "Eu comecei a estudar cedo." },
          { form: "começou", meaning: "you started / began", pron: "koh-meh-SOH", example: "Você começou o livro já?" },
          { form: "começamos", meaning: "we started / began", pron: "koh-meh-SAH-moosh", example: "Nós começamos a reunião às nove." },
          { form: "começaram", meaning: "you all started / began", pron: "koh-meh-SAH-rahng", example: "Vocês começaram sem mim?" },
        ],
        imperfeito: [
          { form: "começava", meaning: "I used to start / begin / was starting", pron: "koh-meh-SAH-vah", example: "Eu começava a estudar às sete." },
          { form: "começava", meaning: "you used to start / begin / were starting", pron: "koh-meh-SAH-vah", example: "Você começava o dia cedo?" },
          { form: "começávamos", meaning: "we used to start / begin / were starting", pron: "koh-meh-SAH-vah-moosh", example: "Nós começávamos a aula com música." },
          { form: "começavam", meaning: "you all used to start / begin / were starting", pron: "koh-meh-SAH-vahng", example: "Vocês começavam o trabalho às oito?" },
        ],
      },
    },
    {
      pt: "terminar", en: "to finish", category: "Ações do dia a dia",
      tenses: {
        presente: [
          { form: "termino", meaning: "I finish", pron: "ter-MEE-noo", example: "Eu termino o trabalho até amanhã." },
          { form: "termina", meaning: "you finish", pron: "ter-MEE-nah", example: "Você termina cedo hoje?" },
          { form: "terminamos", meaning: "we finish", pron: "ter-mee-NAH-moosh", example: "Nós terminamos o projeto na sexta." },
          { form: "terminam", meaning: "you all finish", pron: "ter-MEE-nahng", example: "Vocês terminam antes do prazo?" },
        ],
        perfeito: [
          { form: "terminei", meaning: "I finished", pron: "tehr-mee-NAY", example: "Eu terminei o relatório antes do prazo." },
          { form: "terminou", meaning: "you finished", pron: "tehr-mee-NOH", example: "Você terminou a tarefa?" },
          { form: "terminamos", meaning: "we finished", pron: "tehr-mee-NAH-moosh", example: "Nós terminamos a reunião mais cedo." },
          { form: "terminaram", meaning: "you all finished", pron: "tehr-mee-NAH-rahng", example: "Vocês terminaram o exercício?" },
        ],
        imperfeito: [
          { form: "terminava", meaning: "I used to finish / end / was finishing", pron: "tehr-mee-NAH-vah", example: "Eu terminava o trabalho antes das seis." },
          { form: "terminava", meaning: "you used to finish / end / were finishing", pron: "tehr-mee-NAH-vah", example: "Você terminava a tarefa a tempo?" },
          { form: "terminávamos", meaning: "we used to finish / end / were finishing", pron: "tehr-mee-NAH-vah-moosh", example: "Nós terminávamos as reuniões cedo." },
          { form: "terminavam", meaning: "you all used to finish / end", pron: "tehr-mee-NAH-vahng", example: "Vocês terminavam tudo no prazo?" },
        ],
      },
    },
    {
      pt: "acabar", en: "to end, to end up, to run out (acabar de = to have just)", category: "Ações do dia a dia",
      tenses: {
        presente: [
          { form: "acabo", meaning: "I end up", pron: "ah-KAH-boo", example: "Eu sempre acabo dormindo no sofá." },
          { form: "acaba", meaning: "you end up / it ends", pron: "ah-KAH-bah", example: "Você sempre acaba chegando atrasado." },
          { form: "acabamos", meaning: "we end up", pron: "ah-kah-BAH-moosh", example: "Nós acabamos indo pra praia mesmo assim." },
          { form: "acabam", meaning: "you all end up", pron: "ah-KAH-bahng", example: "Vocês acabam sempre no mesmo boteco." },
        ],
        perfeito: [
          { form: "acabei", meaning: "I ended up / I just…", pron: "ah-kah-BAY", example: "Eu acabei de chegar em casa." },
          { form: "acabou", meaning: "you ended up / you just… / it ran out", pron: "ah-kah-BOH", example: "Você acabou de acordar?" },
          { form: "acabamos", meaning: "we ended up / we just…", pron: "ah-kah-BAH-moosh", example: "Nós acabamos de almoçar." },
          { form: "acabaram", meaning: "you all ended up / you all just…", pron: "ah-kah-BAH-rahng", example: "Vocês acabaram de chegar?" },
        ],
        imperfeito: [
          { form: "acabava", meaning: "I used to end up", pron: "ah-kah-BAH-vah", example: "Eu acabava sempre pagando a conta." },
          { form: "acabava", meaning: "you used to end up", pron: "ah-kah-BAH-vah", example: "Você acabava dormindo na aula?" },
          { form: "acabávamos", meaning: "we used to end up", pron: "ah-kah-BAH-vah-moosh", example: "Nós acabávamos sempre na casa da vovó." },
          { form: "acabavam", meaning: "you all used to end up", pron: "ah-kah-BAH-vahng", example: "Vocês acabavam brigando toda vez?" },
        ],
      },
    },
    {
      pt: "tentar", en: "to try", category: "Ações do dia a dia",
      tenses: {
        presente: [
          { form: "tento", meaning: "I try", pron: "TEN-too", example: "Eu tento falar português todo dia." },
          { form: "tenta", meaning: "you try", pron: "TEN-tah", example: "Você tenta de novo?" },
          { form: "tentamos", meaning: "we try", pron: "ten-TAH-moosh", example: "Nós tentamos achar um jeito." },
          { form: "tentam", meaning: "you all try", pron: "TEN-tahng", example: "Vocês tentam uma outra hora?" },
        ],
        perfeito: [
          { form: "tentei", meaning: "I tried", pron: "ten-TAY", example: "Eu tentei ligar várias vezes." },
          { form: "tentou", meaning: "you tried", pron: "ten-TOH", example: "Você tentou resolver o problema?" },
          { form: "tentamos", meaning: "we tried", pron: "ten-TAH-moosh", example: "Nós tentamos uma rota diferente." },
          { form: "tentaram", meaning: "you all tried", pron: "ten-TAH-rahng", example: "Vocês tentaram entrar em contato?" },
        ],
        imperfeito: [
          { form: "tentava", meaning: "I used to try / was trying", pron: "ten-TAH-vah", example: "Eu tentava dormir cedo." },
          { form: "tentava", meaning: "you used to try / were trying", pron: "ten-TAH-vah", example: "Você tentava acordar às seis?" },
          { form: "tentávamos", meaning: "we used to try / were trying", pron: "ten-TAH-vah-moosh", example: "Nós tentávamos chegar no horário." },
          { form: "tentavam", meaning: "you all used to try", pron: "ten-TAH-vahng", example: "Vocês tentavam falar português?" },
        ],
      },
    },
    {
      pt: "conseguir", en: "to manage, to succeed", category: "Ações do dia a dia", irregular: true,
      tenses: {
        presente: [
          { form: "consigo", meaning: "I manage", pron: "kohn-SEE-goo", example: "Eu consigo fazer isso sozinho." },
          { form: "consegue", meaning: "you manage", pron: "kohn-SEH-ghee", example: "Você consegue abrir esse pote?" },
          { form: "conseguimos", meaning: "we manage", pron: "kohn-seh-GHEE-moosh", example: "Nós conseguimos chegar a tempo." },
          { form: "conseguem", meaning: "you all manage", pron: "kohn-SEH-gheng", example: "Vocês conseguem vir amanhã?" },
        ],
        perfeito: [
          { form: "consegui", meaning: "I managed / got", pron: "kon-seh-GHEE", example: "Eu consegui um ingresso de última hora." },
          { form: "conseguiu", meaning: "you managed / got", pron: "kon-seh-GHEE-oo", example: "Você conseguiu falar com ele?" },
          { form: "conseguimos", meaning: "we managed / got", pron: "kon-seh-GHEE-moosh", example: "Nós conseguimos chegar antes do fechamento." },
          { form: "conseguiram", meaning: "you all managed / got", pron: "kon-seh-GHEE-rahng", example: "Vocês conseguiram resolver o problema?" },
        ],
        imperfeito: [
          { form: "conseguia", meaning: "I used to manage / achieve / was managing", pron: "kon-seh-GHEE-ah", example: "Eu conseguia dormir em qualquer lugar." },
          { form: "conseguia", meaning: "you used to manage / achieve / were managing", pron: "kon-seh-GHEE-ah", example: "Você conseguia resolver isso sozinha?" },
          { form: "conseguíamos", meaning: "we used to manage / achieve / were managing", pron: "kon-seh-GHEE-ah-moosh", example: "Nós conseguíamos trabalhar bem juntos." },
          { form: "conseguiam", meaning: "you all used to manage / achieve", pron: "kon-seh-GHEE-ahng", example: "Vocês conseguiam se comunicar em inglês?" },
        ],
      },
    },
    {
      pt: "mostrar", en: "to show", category: "Ações do dia a dia",
      tenses: {
        presente: [
          { form: "mostro", meaning: "I show", pron: "MOHS-troo", example: "Eu mostro o caminho." },
          { form: "mostra", meaning: "you show", pron: "MOHS-trah", example: "Você mostra o ingresso na entrada?" },
          { form: "mostramos", meaning: "we show", pron: "mohs-TRAH-moosh", example: "Nós mostramos o apartamento pra eles." },
          { form: "mostram", meaning: "you all show", pron: "MOHS-trahng", example: "Vocês mostram o que aprenderam?" },
        ],
        perfeito: [
          { form: "mostrei", meaning: "I showed", pron: "mohs-TRAY", example: "Eu mostrei as fotos para a família." },
          { form: "mostrou", meaning: "you showed", pron: "mohs-TROH", example: "Você mostrou o projeto para o chefe?" },
          { form: "mostramos", meaning: "we showed", pron: "mohs-TRAH-moosh", example: "Nós mostramos o caminho para eles." },
          { form: "mostraram", meaning: "you all showed", pron: "mohs-TRAH-rahng", example: "Vocês mostraram o resultado final?" },
        ],
        imperfeito: [
          { form: "mostrava", meaning: "I used to show / was showing", pron: "mohs-TRAH-vah", example: "Eu mostrava as fotos para todo mundo." },
          { form: "mostrava", meaning: "you used to show / were showing", pron: "mohs-TRAH-vah", example: "Você mostrava o caminho para os turistas?" },
          { form: "mostrávamos", meaning: "we used to show / were showing", pron: "mohs-TRAH-vah-moosh", example: "Nós mostrávamos o projeto na reunião." },
          { form: "mostravam", meaning: "you all used to show", pron: "mohs-TRAH-vahng", example: "Vocês mostravam o trabalho para o chefe?" },
        ],
      },
    },
    {
      pt: "limpar", en: "to clean", category: "Ações do dia a dia",
      tenses: {
        presente: [
          { form: "limpo", meaning: "I clean", pron: "LEEM-poo", example: "Eu limpo a casa todo sábado." },
          { form: "limpa", meaning: "you clean", pron: "LEEM-pah", example: "Você limpa o apartamento sozinho?" },
          { form: "limpamos", meaning: "we clean", pron: "leem-PAH-moosh", example: "Nós limpamos antes dos convidados chegarem." },
          { form: "limpam", meaning: "you all clean", pron: "LEEM-pahng", example: "Vocês limpam antes de sair?" },
        ],
        perfeito: [
          { form: "limpei", meaning: "I cleaned", pron: "lim-PAY", example: "Eu limpei a casa inteira ontem." },
          { form: "limpou", meaning: "you cleaned", pron: "lim-POH", example: "Você limpou o banheiro?" },
          { form: "limpamos", meaning: "we cleaned", pron: "lim-PAH-moosh", example: "Nós limpamos o apartamento antes da festa." },
          { form: "limparam", meaning: "you all cleaned", pron: "lim-PAH-rahng", example: "Vocês limparam a sala antes?" },
        ],
        imperfeito: [
          { form: "limpava", meaning: "I used to clean / was cleaning", pron: "leem-PAH-vah", example: "Eu limpava a casa todo sábado." },
          { form: "limpava", meaning: "you used to clean / were cleaning", pron: "leem-PAH-vah", example: "Você limpava o quarto com frequência?" },
          { form: "limpávamos", meaning: "we used to clean / were cleaning", pron: "leem-PAH-vah-moosh", example: "Nós limpávamos a cozinha depois de comer." },
          { form: "limpavam", meaning: "you all used to clean", pron: "leem-PAH-vahng", example: "Vocês limpavam o apartamento juntos?" },
        ],
      },
    },
    {
      pt: "arrumar", en: "to tidy up, to fix (up)", category: "Ações do dia a dia",
      tenses: {
        presente: [
          { form: "arrumo", meaning: "I tidy up / fix", pron: "ah-HOO-moo", example: "Eu arrumo a cama toda manhã." },
          { form: "arruma", meaning: "you tidy up / fix", pron: "ah-HOO-mah", example: "Você arruma o quarto hoje?" },
          { form: "arrumamos", meaning: "we tidy up / fix", pron: "ah-hoo-MAH-moosh", example: "Nós arrumamos a casa antes da visita." },
          { form: "arrumam", meaning: "you all tidy up / fix", pron: "ah-HOO-mahng", example: "Vocês arrumam a mala na véspera?" },
        ],
        perfeito: [
          { form: "arrumei", meaning: "I tidied up / fixed", pron: "ah-hoo-MAY", example: "Eu arrumei a sala rapidinho." },
          { form: "arrumou", meaning: "you tidied up / fixed", pron: "ah-hoo-MOH", example: "Você arrumou o chuveiro?" },
          { form: "arrumamos", meaning: "we tidied up / fixed", pron: "ah-hoo-MAH-moosh", example: "Nós arrumamos tudo antes de sair." },
          { form: "arrumaram", meaning: "you all tidied up / fixed", pron: "ah-hoo-MAH-rahng", example: "Vocês arrumaram a cozinha?" },
        ],
        imperfeito: [
          { form: "arrumava", meaning: "I used to tidy up / fix", pron: "ah-hoo-MAH-vah", example: "Eu arrumava a casa aos sábados." },
          { form: "arrumava", meaning: "you used to tidy up / fix", pron: "ah-hoo-MAH-vah", example: "Você arrumava seu quarto quando criança?" },
          { form: "arrumávamos", meaning: "we used to tidy up / fix", pron: "ah-hoo-MAH-vah-moosh", example: "Nós arrumávamos tudo juntos." },
          { form: "arrumavam", meaning: "you all used to tidy up / fix", pron: "ah-hoo-MAH-vahng", example: "Vocês arrumavam a mesa depois do jantar?" },
        ],
      },
    },
    {
      pt: "trazer", en: "to bring", category: "Ações e movimentos", irregular: true,
      tenses: {
        presente: [
          { form: "trago", meaning: "I bring", pron: "TRAH-goo", example: "Eu trago o vinho para a festa." },
          { form: "traz", meaning: "you bring", pron: "TRAHSH", example: "Você traz a comida?" },
          { form: "trazemos", meaning: "we bring", pron: "trah-ZEH-moosh", example: "Nós trazemos os documentos amanhã." },
          { form: "trazem", meaning: "you all bring", pron: "TRAH-zeng", example: "Vocês trazem os amigos também?" },
        ],
        perfeito: [
          { form: "trouxe", meaning: "I brought", pron: "TROH-see", example: "Eu trouxe sobremesa para o jantar." },
          { form: "trouxe", meaning: "you brought", pron: "TROH-see", example: "Você trouxe as chaves?" },
          { form: "trouxemos", meaning: "we brought", pron: "troh-SEH-moosh", example: "Nós trouxemos água para todo mundo." },
          { form: "trouxeram", meaning: "you all brought", pron: "troh-SEH-rahng", example: "Vocês trouxeram os documentos?" },
        ],
        imperfeito: [
          { form: "trazia", meaning: "I used to bring / was bringing", pron: "trah-ZEE-ah", example: "Eu trazia lanche de casa todo dia." },
          { form: "trazia", meaning: "you used to bring / were bringing", pron: "trah-ZEE-ah", example: "Você trazia flores para a professora?" },
          { form: "trazíamos", meaning: "we used to bring / were bringing", pron: "trah-ZEE-ah-moosh", example: "Nós trazíamos comida para a festa." },
          { form: "traziam", meaning: "you all used to bring / were bringing", pron: "trah-ZEE-ahng", example: "Vocês traziam novidades da viagem?" },
        ],
        subjuntivo: [
          { form: "trouxesse", meaning: "if I brought", pron: "troh-SEH-see", example: "Se eu trouxesse o guarda-chuva, não me molhava tanto." },
          { form: "trouxesse", meaning: "if you brought", pron: "troh-SEH-see", example: "Queria que você trouxesse aquele bolo da sua mãe." },
          { form: "trouxéssemos", meaning: "if we brought", pron: "troh-SEH-seh-moosh", example: "Era melhor que nós trouxéssemos comida de casa." },
          { form: "trouxessem", meaning: "if you all brought", pron: "troh-SEH-seng", example: "Ele falou como se vocês trouxessem azar pro time." },
        ],
      },
    },
    {
      pt: "colocar", en: "to put, to place", category: "Ações e movimentos",
      tenses: {
        presente: [
          { form: "coloco", meaning: "I put / place", pron: "koh-LOH-koo", example: "Eu coloco o livro na mesa." },
          { form: "coloca", meaning: "you put / place", pron: "koh-LOH-kah", example: "Você coloca açúcar no café?" },
          { form: "colocamos", meaning: "we put / place", pron: "koh-loh-KAH-moosh", example: "Nós colocamos as compras na cozinha." },
          { form: "colocam", meaning: "you all put / place", pron: "koh-LOH-kahng", example: "Vocês colocam gelo na cerveja?" },
        ],
        perfeito: [
          { form: "coloquei", meaning: "I put / placed", pron: "koh-loh-KAY", example: "Eu coloquei as chaves na bolsa." },
          { form: "colocou", meaning: "you put / placed", pron: "koh-loh-KOH", example: "Você colocou sal na comida?" },
          { form: "colocamos", meaning: "we put / placed", pron: "koh-loh-KAH-moosh", example: "Nós colocamos tudo no lugar ontem." },
          { form: "colocaram", meaning: "you all put / placed", pron: "koh-loh-KAH-rahng", example: "Vocês colocaram a mesa na varanda?" },
        ],
        imperfeito: [
          { form: "colocava", meaning: "I used to put / place / was putting", pron: "koh-loh-KAH-vah", example: "Eu colocava tudo em cima da cama." },
          { form: "colocava", meaning: "you used to put / place / were putting", pron: "koh-loh-KAH-vah", example: "Você colocava açúcar no suco?" },
          { form: "colocávamos", meaning: "we used to put / place / were putting", pron: "koh-loh-KAH-vah-moosh", example: "Nós colocávamos as bicicletas na garagem." },
          { form: "colocavam", meaning: "you all used to put / place / were putting", pron: "koh-loh-KAH-vahng", example: "Vocês colocavam os sapatos na porta?" },
        ],
      },
    },
    {
      pt: "tirar", en: "to take (photo, vacation), to take off, to remove", category: "Ações e movimentos",
      tenses: {
        presente: [
          { form: "tiro", meaning: "I take", pron: "CHEE-roo", example: "Eu tiro uma foto." },
          { form: "tira", meaning: "you take", pron: "CHEE-rah", example: "Você tira o casaco?" },
          { form: "tiramos", meaning: "we take", pron: "chee-RAH-moosh", example: "Nós tiramos uma selfie ali." },
          { form: "tiram", meaning: "you all take", pron: "CHEE-rahng", example: "Vocês tiram os sapatos na entrada?" },
        ],
        perfeito: [
          { form: "tirei", meaning: "I took / removed", pron: "chee-RAY", example: "Eu tirei uma foto da paisagem." },
          { form: "tirou", meaning: "you took / removed", pron: "chee-ROH", example: "Você tirou o casaco antes de entrar?" },
          { form: "tiramos", meaning: "we took / removed", pron: "chee-RAH-moosh", example: "Nós tiramos uma selfie no parque." },
          { form: "tiraram", meaning: "you all took / removed", pron: "chee-RAH-rahng", example: "Vocês tiraram as malas do carro?" },
        ],
        imperfeito: [
          { form: "tirava", meaning: "I used to take off / remove / was taking", pron: "chee-RAH-vah", example: "Eu tirava foto de tudo." },
          { form: "tirava", meaning: "you used to take off / remove / were taking", pron: "chee-RAH-vah", example: "Você tirava as dúvidas com o professor?" },
          { form: "tirávamos", meaning: "we used to take off / remove / were taking", pron: "chee-RAH-vah-moosh", example: "Nós tirávamos férias no verão." },
          { form: "tiravam", meaning: "you all used to take off / remove", pron: "chee-RAH-vahng", example: "Vocês tiravam o sapato na entrada?" },
        ],
      },
    },
    {
      pt: "deixar", en: "to leave (behind), to let", category: "Ações e movimentos",
      tenses: {
        presente: [
          { form: "deixo", meaning: "I leave", pron: "DAY-shoo", example: "Eu deixo a chave na porta." },
          { form: "deixa", meaning: "you leave", pron: "DAY-shah", example: "Você deixa a janela aberta?" },
          { form: "deixamos", meaning: "we leave", pron: "day-SHAH-moosh", example: "Nós deixamos a gorjeta na mesa." },
          { form: "deixam", meaning: "you all leave", pron: "DAY-shahng", example: "Vocês deixam as malas aqui?" },
        ],
        perfeito: [
          { form: "deixei", meaning: "I left / let", pron: "day-SHAY", example: "Eu deixei o celular em casa." },
          { form: "deixou", meaning: "you left / let", pron: "day-SHOH", example: "Você deixou a porta aberta?" },
          { form: "deixamos", meaning: "we left / let", pron: "day-SHAH-moosh", example: "Nós deixamos um recado na secretária." },
          { form: "deixaram", meaning: "you all left / let", pron: "day-SHAH-rahng", example: "Vocês deixaram as chaves na mesa?" },
        ],
        imperfeito: [
          { form: "deixava", meaning: "I used to leave / let / was leaving", pron: "day-SHAH-vah", example: "Eu deixava as chaves na mesa." },
          { form: "deixava", meaning: "you used to leave / let / were leaving", pron: "day-SHAH-vah", example: "Você deixava a porta aberta?" },
          { form: "deixávamos", meaning: "we used to leave / let / were leaving", pron: "day-SHAH-vah-moosh", example: "Nós deixávamos o cachorro solto." },
          { form: "deixavam", meaning: "you all used to leave / let", pron: "day-SHAH-vahng", example: "Vocês deixavam a luz acesa?" },
        ],
        subjuntivo: [
          { form: "deixasse", meaning: "if I left / let", pron: "day-SHAH-see", example: "Se eu deixasse o carro em casa, chegava mais rápido." },
          { form: "deixasse", meaning: "if you left / let", pron: "day-SHAH-see", example: "Queria que você deixasse a chave com o porteiro." },
          { form: "deixássemos", meaning: "if we left / let", pron: "day-SHAH-seh-moosh", example: "Era melhor que nós deixássemos esse assunto pra amanhã." },
          { form: "deixassem", meaning: "if you all left / let", pron: "day-SHAH-seng", example: "Saí de fininho antes que vocês deixassem a festa." },
        ],
      },
    },
    {
      pt: "passar", en: "to pass, to spend (time)", category: "Ações e movimentos",
      tenses: {
        presente: [
          { form: "passo", meaning: "I pass / spend (time)", pron: "PAH-soo", example: "Eu passo o domingo na praia." },
          { form: "passa", meaning: "you pass / spend (time)", pron: "PAH-sah", example: "Você passa na farmácia hoje?" },
          { form: "passamos", meaning: "we pass / spend (time)", pron: "pah-SAH-moosh", example: "Nós passamos as férias no interior." },
          { form: "passam", meaning: "you all pass / spend (time)", pron: "PAH-sahng", example: "Vocês passam aqui sempre?" },
        ],
        perfeito: [
          { form: "passei", meaning: "I passed / spent (time)", pron: "pah-SAY", example: "Eu passei o fim de semana em casa." },
          { form: "passou", meaning: "you passed / spent (time)", pron: "pah-SOH", example: "Você passou no mercado?" },
          { form: "passamos", meaning: "we passed / spent (time)", pron: "pah-SAH-moosh", example: "Nós passamos o Natal na casa da vó." },
          { form: "passaram", meaning: "you all passed / spent (time)", pron: "pah-SAH-rahng", example: "Vocês passaram na frente do prédio?" },
        ],
        imperfeito: [
          { form: "passava", meaning: "I used to pass / spend / was passing (time)", pron: "pah-SAH-vah", example: "Eu passava as tardes lendo." },
          { form: "passava", meaning: "you used to pass / spend / were passing (time)", pron: "pah-SAH-vah", example: "Você passava por aqui todo dia?" },
          { form: "passávamos", meaning: "we used to pass / spend / were passing (time)", pron: "pah-SAH-vah-moosh", example: "Nós passávamos o verão na praia." },
          { form: "passavam", meaning: "you all used to pass / spend / were passing (time)", pron: "pah-SAH-vahng", example: "Vocês passavam muito tempo juntos?" },
        ],
        subjuntivo: [
          { form: "passasse", meaning: "if I passed / spent (time)", pron: "pah-SAH-see", example: "Ela queria que eu passasse o fim de semana lá." },
          { form: "passasse", meaning: "if you passed / spent (time)", pron: "pah-SAH-see", example: "Se você passasse lá em casa, a gente conversava melhor." },
          { form: "passássemos", meaning: "if we passed / spent (time)", pron: "pah-SAH-seh-moosh", example: "Era melhor que nós passássemos na padaria antes do almoço." },
          { form: "passassem", meaning: "if you all passed / spent (time)", pron: "pah-SAH-seng", example: "Gostaria que vocês passassem mais tempo com a vovó." },
        ],
      },
    },
    {
      pt: "parar", en: "to stop", category: "Ações e movimentos",
      tenses: {
        presente: [
          { form: "paro", meaning: "I stop", pron: "PAH-roo", example: "Eu paro de trabalhar às seis." },
          { form: "para", meaning: "you stop", pron: "PAH-rah", example: "Você para no sinal?" },
          { form: "paramos", meaning: "we stop", pron: "pah-RAH-moosh", example: "Nós paramos pra tomar café." },
          { form: "param", meaning: "you all stop", pron: "PAH-rahng", example: "Vocês param de falar um minuto?" },
        ],
        perfeito: [
          { form: "parei", meaning: "I stopped", pron: "pah-RAY", example: "Eu parei de fumar no ano passado." },
          { form: "parou", meaning: "you stopped", pron: "pah-ROH", example: "Você parou o carro na esquina?" },
          { form: "paramos", meaning: "we stopped", pron: "pah-RAH-moosh", example: "Nós paramos pra almoçar no caminho." },
          { form: "pararam", meaning: "you all stopped", pron: "pah-RAH-rahng", example: "Vocês pararam de trabalhar tarde?" },
        ],
        imperfeito: [
          { form: "parava", meaning: "I used to stop / was stopping", pron: "pah-RAH-vah", example: "Eu parava sempre naquela padaria." },
          { form: "parava", meaning: "you used to stop / were stopping", pron: "pah-RAH-vah", example: "Você parava pra descansar?" },
          { form: "parávamos", meaning: "we used to stop / were stopping", pron: "pah-RAH-vah-moosh", example: "Nós parávamos de trabalhar mais cedo." },
          { form: "paravam", meaning: "you all used to stop / were stopping", pron: "pah-RAH-vahng", example: "Vocês paravam nesse posto?" },
        ],
      },
    },
    {
      pt: "continuar", en: "to continue", category: "Ações e movimentos",
      tenses: {
        presente: [
          { form: "continuo", meaning: "I continue", pron: "kohn-chee-NOO-oo", example: "Eu continuo estudando mesmo assim." },
          { form: "continua", meaning: "you continue", pron: "kohn-chee-NOO-ah", example: "Você continua aqui amanhã?" },
          { form: "continuamos", meaning: "we continue", pron: "kohn-chee-noo-AH-moosh", example: "Nós continuamos a viagem depois." },
          { form: "continuam", meaning: "you all continue", pron: "kohn-chee-NOO-ahng", example: "Vocês continuam trabalhando nisso?" },
        ],
        perfeito: [
          { form: "continuei", meaning: "I continued", pron: "kon-chee-noo-AY", example: "Eu continuei o trabalho depois do almoço." },
          { form: "continuou", meaning: "you continued", pron: "kon-chee-noo-OH", example: "Você continuou assistindo a série?" },
          { form: "continuamos", meaning: "we continued", pron: "kon-chee-noo-AH-moosh", example: "Nós continuamos a conversa no café." },
          { form: "continuaram", meaning: "you all continued", pron: "kon-chee-noo-AH-rahng", example: "Vocês continuaram o projeto sem mim?" },
        ],
        imperfeito: [
          { form: "continuava", meaning: "I used to continue / keep / was continuing", pron: "kon-chee-noo-AH-vah", example: "Eu continuava estudando mesmo cansada." },
          { form: "continuava", meaning: "you used to continue / keep / were continuing", pron: "kon-chee-noo-AH-vah", example: "Você continuava tentando mesmo assim?" },
          { form: "continuávamos", meaning: "we used to continue / keep / were continuing", pron: "kon-chee-noo-AH-vah-moosh", example: "Nós continuávamos o projeto sem parar." },
          { form: "continuavam", meaning: "you all used to continue / keep", pron: "kon-chee-noo-AH-vahng", example: "Vocês continuavam trabalhando tarde da noite?" },
        ],
      },
    },
    {
      pt: "mudar", en: "to change, to move (house)", category: "Ações e movimentos",
      tenses: {
        presente: [
          { form: "mudo", meaning: "I change", pron: "MOO-doo", example: "Eu mudo de assunto às vezes." },
          { form: "muda", meaning: "you change", pron: "MOO-dah", example: "Você muda de ideia com frequência?" },
          { form: "mudamos", meaning: "we change", pron: "moo-DAH-moosh", example: "Nós mudamos os móveis de lugar toda semana." },
          { form: "mudam", meaning: "you all change", pron: "MOO-dahng", example: "Vocês mudam de trabalho logo?" },
        ],
        perfeito: [
          { form: "mudei", meaning: "I changed", pron: "moo-DAY", example: "Eu mudei de ideia na última hora." },
          { form: "mudou", meaning: "you changed", pron: "moo-DOH", example: "Você mudou o plano?" },
          { form: "mudamos", meaning: "we changed", pron: "moo-DAH-moosh", example: "Nós mudamos de apartamento no ano passado." },
          { form: "mudaram", meaning: "you all changed", pron: "moo-DAH-rahng", example: "Vocês mudaram de opinião?" },
        ],
        imperfeito: [
          { form: "mudava", meaning: "I used to change / move / was changing", pron: "moo-DAH-vah", example: "Eu mudava de ideia com frequência." },
          { form: "mudava", meaning: "you used to change / move / were changing", pron: "moo-DAH-vah", example: "Você mudava de assunto na hora errada?" },
          { form: "mudávamos", meaning: "we used to change / move / were changing", pron: "moo-DAH-vah-moosh", example: "Nós mudávamos os planos de última hora." },
          { form: "mudavam", meaning: "you all used to change / move", pron: "moo-DAH-vahng", example: "Vocês mudavam muito durante esse período?" },
        ],
      },
    },
    {
      pt: "correr", en: "to run", category: "Ações e movimentos",
      tenses: {
        presente: [
          { form: "corro", meaning: "I run", pron: "KOH-hoo", example: "Eu corro no parque." },
          { form: "corre", meaning: "you run", pron: "KOH-hee", example: "Você corre de manhã?" },
          { form: "corremos", meaning: "we run", pron: "koh-HEH-moosh", example: "Nós corremos na praia." },
          { form: "correm", meaning: "you all run", pron: "KOH-heng", example: "Vocês correm juntos?" },
        ],
        perfeito: [
          { form: "corri", meaning: "I ran", pron: "koh-HEE", example: "Eu corri no parque hoje cedo." },
          { form: "correu", meaning: "you ran", pron: "koh-HEH-oo", example: "Você correu na esteira ontem?" },
          { form: "corremos", meaning: "we ran", pron: "koh-HEH-moosh", example: "Nós corremos cinco quilômetros." },
          { form: "correram", meaning: "you all ran", pron: "koh-HEH-rahng", example: "Vocês correram no final de semana?" },
        ],
        imperfeito: [
          { form: "corria", meaning: "I used to run / was running", pron: "koh-HEE-ah", example: "Eu corria no parque toda manhã." },
          { form: "corria", meaning: "you used to run / were running", pron: "koh-HEE-ah", example: "Você corria na escola na educação física?" },
          { form: "corríamos", meaning: "we used to run / were running", pron: "koh-HEE-ah-moosh", example: "Nós corríamos juntos no fim da tarde." },
          { form: "corriam", meaning: "you all used to run / were running", pron: "koh-HEE-ahng", example: "Vocês corriam na praia?" },
        ],
      },
    },
    {
      pt: "cair", en: "to fall", category: "Ações e movimentos", irregular: true,
      tenses: {
        presente: [
          { form: "caio", meaning: "I fall", pron: "KAI-oo", example: "Eu caio sempre nessa pegadinha." },
          { form: "cai", meaning: "you fall", pron: "KAI", example: "Você cai muito de bicicleta?" },
          { form: "caímos", meaning: "we fall", pron: "kah-EE-moosh", example: "Nós caímos na mesma armadilha." },
          { form: "caem", meaning: "you all fall", pron: "KAH-eng", example: "Vocês caem nesse golpe?" },
        ],
        perfeito: [
          { form: "caí", meaning: "I fell", pron: "kah-EE", example: "Eu caí da escada ontem." },
          { form: "caiu", meaning: "you fell", pron: "kah-EE-oo", example: "Você caiu no chão?" },
          { form: "caímos", meaning: "we fell", pron: "kah-EE-moosh", example: "Nós caímos no meio do caminho." },
          { form: "caíram", meaning: "you all fell", pron: "kah-EE-rahng", example: "Vocês caíram da bicicleta?" },
        ],
        imperfeito: [
          { form: "caía", meaning: "I used to fall / was falling", pron: "kah-EE-ah", example: "Eu caía muito quando era criança." },
          { form: "caía", meaning: "you used to fall / were falling", pron: "kah-EE-ah", example: "Você caía da cama dormindo?" },
          { form: "caíamos", meaning: "we used to fall / were falling", pron: "kah-EE-ah-moosh", example: "Nós caíamos sempre nessa pegadinha." },
          { form: "caíam", meaning: "you all used to fall / were falling", pron: "kah-EE-ahng", example: "Vocês caíam de patins?" },
        ],
      },
    },
    {
      pt: "andar", en: "to walk, to go around", category: "Ações e movimentos",
      tenses: {
        presente: [
          { form: "ando", meaning: "I walk", pron: "AHN-doo", example: "Eu ando até a estação." },
          { form: "anda", meaning: "you walk", pron: "AHN-dah", example: "Você anda muito no centro?" },
          { form: "andamos", meaning: "we walk", pron: "ahn-DAH-moosh", example: "Nós andamos pelo bairro à tarde." },
          { form: "andam", meaning: "you all walk", pron: "AHN-dahng", example: "Vocês andam até a escola?" },
        ],
        perfeito: [
          { form: "andei", meaning: "I walked", pron: "an-DAY", example: "Eu andei muito ontem." },
          { form: "andou", meaning: "you walked", pron: "an-DOH", example: "Você andou até a praia?" },
          { form: "andamos", meaning: "we walked", pron: "an-DAH-moosh", example: "Nós andamos pelo centro." },
          { form: "andaram", meaning: "you all walked", pron: "an-DAH-rahng", example: "Vocês andaram de ônibus?" },
        ],
        imperfeito: [
          { form: "andava", meaning: "I used to walk / go / was walking", pron: "an-DAH-vah", example: "Eu andava de patins no calçadão." },
          { form: "andava", meaning: "you used to walk / go / were walking", pron: "an-DAH-vah", example: "Você andava de bicicleta no bairro?" },
          { form: "andávamos", meaning: "we used to walk / go / were walking", pron: "an-DAH-vah-moosh", example: "Nós andávamos muito pela cidade." },
          { form: "andavam", meaning: "you all used to walk / go / were walking", pron: "an-DAH-vahng", example: "Vocês andavam de ônibus para a escola?" },
        ],
      },
    },
    {
      pt: "botar", en: "to put (colloquial)", category: "Ações e movimentos",
      tenses: {
        presente: [
          { form: "boto", meaning: "I put", pron: "BOH-too", example: "Eu boto o celular na bolsa." },
          { form: "bota", meaning: "you put", pron: "BOH-tah", example: "Você bota açúcar no café?" },
          { form: "botamos", meaning: "we put", pron: "boh-TAH-moosh", example: "Nós botamos tudo no carro." },
          { form: "botam", meaning: "you all put", pron: "BOH-tahng", example: "Vocês botam a mesa antes do jantar?" },
        ],
        perfeito: [
          { form: "botei", meaning: "I put / placed", pron: "boh-TAY", example: "Eu botei o casaco na cadeira." },
          { form: "botou", meaning: "you put / placed", pron: "boh-TOH", example: "Você botou açúcar no café?" },
          { form: "botamos", meaning: "we put / placed", pron: "boh-TAH-moosh", example: "Nós botamos a mesa para o jantar." },
          { form: "botaram", meaning: "you all put / placed", pron: "boh-TAH-rahng", example: "Vocês botaram as coisas no lugar?" },
        ],
        imperfeito: [
          { form: "botava", meaning: "I used to put / place / was putting", pron: "boh-TAH-vah", example: "Eu botava açúcar no café." },
          { form: "botava", meaning: "you used to put / place / were putting", pron: "boh-TAH-vah", example: "Você botava sal na comida?" },
          { form: "botávamos", meaning: "we used to put / place / were putting", pron: "boh-TAH-vah-moosh", example: "Nós botávamos a mesa antes do jantar." },
          { form: "botavam", meaning: "you all used to put / place", pron: "boh-TAH-vahng", example: "Vocês botavam as coisas no lugar?" },
        ],
      },
    },
    {
      pt: "descer", en: "to go down, to get off", category: "Ações e movimentos",
      tenses: {
        presente: [
          { form: "desço", meaning: "I go down", pron: "DEH-soo", example: "Eu desço na próxima estação." },
          { form: "desce", meaning: "you go down", pron: "DEH-see", example: "Você desce aqui?" },
          { form: "descemos", meaning: "we go down", pron: "deh-SEH-moosh", example: "Nós descemos a escada juntos." },
          { form: "descem", meaning: "you all go down", pron: "DEH-seng", example: "Vocês descem agora?" },
        ],
        perfeito: [
          { form: "desci", meaning: "I went down / descended", pron: "dess-SEE", example: "Eu desci as escadas correndo." },
          { form: "desceu", meaning: "you went down / descended", pron: "deh-SEH-oo", example: "Você desceu na parada certa?" },
          { form: "descemos", meaning: "we went down / descended", pron: "dess-SEH-moosh", example: "Nós descemos juntos do elevador." },
          { form: "desceram", meaning: "you all went down / descended", pron: "dess-SEH-rahng", example: "Vocês desceram antes ou depois?" },
        ],
        imperfeito: [
          { form: "descia", meaning: "I used to go down / descend / was going down", pron: "deh-SEE-ah", example: "Eu descia as escadas correndo." },
          { form: "descia", meaning: "you used to go down / descend / were going down", pron: "deh-SEE-ah", example: "Você descia de elevador ou de escada?" },
          { form: "descíamos", meaning: "we used to go down / descend / were going down", pron: "deh-SEE-ah-moosh", example: "Nós descíamos a serra de carro." },
          { form: "desciam", meaning: "you all used to go down / descend", pron: "deh-SEE-ahng", example: "Vocês desciam para o café todo dia?" },
        ],
      },
    },
    {
      pt: "partir", en: "to leave, to depart", category: "Ações e movimentos",
      tenses: {
        presente: [
          { form: "parto", meaning: "I leave / depart", pron: "PAHR-too", example: "Eu parto amanhã cedo." },
          { form: "parte", meaning: "you leave / depart", pron: "PAHR-chee", example: "Você parte hoje à noite?" },
          { form: "partimos", meaning: "we leave / depart", pron: "pahr-CHEE-moosh", example: "Nós partimos às oito." },
          { form: "partem", meaning: "you all leave / depart", pron: "PAHR-teng", example: "Vocês partem juntos?" },
        ],
        perfeito: [
          { form: "parti", meaning: "I left / departed", pron: "pahr-CHEE", example: "Eu parti logo depois do almoço." },
          { form: "partiu", meaning: "you left / departed", pron: "pahr-CHEE-oo", example: "Você partiu cedo da estação?" },
          { form: "partimos", meaning: "we left / departed", pron: "pahr-CHEE-moosh", example: "Nós partimos antes do trânsito piorar." },
          { form: "partiram", meaning: "you all left / departed", pron: "pahr-CHEE-rahng", example: "Vocês partiram na sexta-feira?" },
        ],
        imperfeito: [
          { form: "partia", meaning: "I used to leave / depart / was leaving", pron: "par-CHEE-ah", example: "Eu partia de casa cedo para o trabalho." },
          { form: "partia", meaning: "you used to leave / depart / were leaving", pron: "par-CHEE-ah", example: "Você partia no mesmo horário todo dia?" },
          { form: "partíamos", meaning: "we used to leave / depart / were leaving", pron: "par-CHEE-ah-moosh", example: "Nós partíamos juntos para a escola." },
          { form: "partiam", meaning: "you all used to leave / depart / were leaving", pron: "par-CHEE-ahng", example: "Vocês partiam de ônibus?" },
        ],
      },
    },
    {
      pt: "pôr", en: "to put, to place", category: "Ações e movimentos", irregular: true,
      tenses: {
        presente: [
          { form: "ponho", meaning: "I put", pron: "POHN-yoo", example: "Eu ponho a comida na mesa." },
          { form: "põe", meaning: "you put", pron: "POYNG", example: "Você põe sal?" },
          { form: "pomos", meaning: "we put", pron: "POH-moosh", example: "Nós pomos as malas no carro." },
          { form: "põem", meaning: "you all put", pron: "POYNG", example: "Vocês põem a mesa?" },
        ],
        perfeito: [
          { form: "pus", meaning: "I put", pron: "POOS", example: "Eu pus a chave na mesa." },
          { form: "pôs", meaning: "you put", pron: "POHS", example: "Você pôs sal na comida?" },
          { form: "pusemos", meaning: "we put", pron: "poo-ZEH-moosh", example: "Nós pusemos as malas no carro." },
          { form: "puseram", meaning: "you all put", pron: "poo-ZEH-rahng", example: "Vocês puseram tudo no lugar?" },
        ],
        imperfeito: [
          { form: "punha", meaning: "I used to put", pron: "POO-nyah", example: "Eu punha açúcar no café antes." },
          { form: "punha", meaning: "you used to put", pron: "POO-nyah", example: "Você punha tudo na mochila?" },
          { form: "púnhamos", meaning: "we used to put", pron: "POO-nyah-moosh", example: "Nós púnhamos os livros na estante." },
          { form: "punham", meaning: "you all used to put", pron: "POO-nyahng", example: "Vocês punham gelo na água?" },
        ],
      },
    },
    {
      pt: "subir", en: "to go up, to climb", category: "Ações e movimentos", irregular: true,
      tenses: {
        presente: [
          { form: "subo", meaning: "I go up", pron: "SOO-boo", example: "Eu subo pelo elevador." },
          { form: "sobe", meaning: "you go up", pron: "SOH-bee", example: "Você sobe a pé ou de elevador?" },
          { form: "subimos", meaning: "we go up", pron: "soo-BEE-moosh", example: "Nós subimos a escada juntos." },
          { form: "sobem", meaning: "you all go up", pron: "SOH-beng", example: "Vocês sobem até o último andar?" },
        ],
        perfeito: [
          { form: "subi", meaning: "I went up / climbed", pron: "soo-BEE", example: "Eu subi as escadas até o quinto andar." },
          { form: "subiu", meaning: "you went up / climbed", pron: "soo-BEE-oo", example: "Você subiu a pé ou de elevador?" },
          { form: "subimos", meaning: "we went up / climbed", pron: "soo-BEE-moosh", example: "Nós subimos o morro juntos." },
          { form: "subiram", meaning: "you all went up / climbed", pron: "soo-BEE-rahng", example: "Vocês subiram até o topo?" },
        ],
        imperfeito: [
          { form: "subia", meaning: "I used to go up / climb / was going up", pron: "soo-BEE-ah", example: "Eu subia as escadas para me exercitar." },
          { form: "subia", meaning: "you used to go up / climb / were going up", pron: "soo-BEE-ah", example: "Você subia no terraço para ver o pôr do sol?" },
          { form: "subíamos", meaning: "we used to go up / climb / were going up", pron: "soo-BEE-ah-moosh", example: "Nós subíamos a serra nas férias." },
          { form: "subiam", meaning: "you all used to go up / climb", pron: "soo-BEE-ahng", example: "Vocês subiam de elevador sempre?" },
        ],
      },
    },
    {
      pt: "virar", en: "to turn (a corner), to become", category: "Ações e movimentos",
      tenses: {
        presente: [
          { form: "viro", meaning: "I turn (a corner) / become", pron: "VEE-roo", example: "Eu viro à direita no sinal." },
          { form: "vira", meaning: "you turn (a corner) / become", pron: "VEE-rah", example: "Você vira a esquina e já vê a praia." },
          { form: "viramos", meaning: "we turn (a corner) / become", pron: "vee-RAH-moosh", example: "Nós viramos à esquerda ali." },
          { form: "viram", meaning: "you all turn (a corner) / become", pron: "VEE-rahng", example: "Vocês viram na segunda rua." },
        ],
        perfeito: [
          { form: "virei", meaning: "I turned (a corner) / became", pron: "vee-RAY", example: "Eu virei vegetariano ano passado." },
          { form: "virou", meaning: "you turned (a corner) / became", pron: "vee-ROH", example: "Você virou carioca de vez!" },
          { form: "viramos", meaning: "we turned (a corner) / became", pron: "vee-RAH-moosh", example: "Nós viramos amigos rapidinho." },
          { form: "viraram", meaning: "you all turned (a corner) / became", pron: "vee-RAH-rahng", example: "Vocês viraram a noite estudando?" },
        ],
        imperfeito: [
          { form: "virava", meaning: "I used to turn (a corner) / become", pron: "vee-RAH-vah", example: "Eu virava a noite jogando videogame." },
          { form: "virava", meaning: "you used to turn (a corner) / become", pron: "vee-RAH-vah", example: "Você virava a esquina errada sempre?" },
          { form: "virávamos", meaning: "we used to turn (a corner) / become", pron: "vee-RAH-vah-moosh", example: "Nós virávamos a noite conversando." },
          { form: "viravam", meaning: "you all used to turn (a corner) / become", pron: "vee-RAH-vahng", example: "Vocês viravam a madrugada no carnaval?" },
        ],
      },
    },
    {
      pt: "sentir", en: "to feel", category: "Sentimentos e percepção", irregular: true,
      tenses: {
        presente: [
          { form: "sinto", meaning: "I feel", pron: "SEEN-too", example: "Eu sinto muito calor aqui." },
          { form: "sente", meaning: "you feel", pron: "SEN-chee", example: "Você sente o cheiro de café?" },
          { form: "sentimos", meaning: "we feel", pron: "sen-CHEE-moosh", example: "Nós sentimos falta da cidade." },
          { form: "sentem", meaning: "you all feel", pron: "SEN-teng", example: "Vocês sentem frio assim?" },
        ],
        perfeito: [
          { form: "senti", meaning: "I felt", pron: "sen-CHEE", example: "Eu senti um frio de repente." },
          { form: "sentiu", meaning: "you felt", pron: "sen-CHEE-oo", example: "Você sentiu a diferença?" },
          { form: "sentimos", meaning: "we felt", pron: "sen-CHEE-moosh", example: "Nós sentimos falta de você." },
          { form: "sentiram", meaning: "you all felt", pron: "sen-CHEE-rahng", example: "Vocês sentiram o cheiro de fumaça?" },
        ],
        imperfeito: [
          { form: "sentia", meaning: "I used to feel / was feeling", pron: "sen-CHEE-ah", example: "Eu sentia saudade da minha cidade." },
          { form: "sentia", meaning: "you used to feel / were feeling", pron: "sen-CHEE-ah", example: "Você sentia frio nessa época do ano?" },
          { form: "sentíamos", meaning: "we used to feel / were feeling", pron: "sen-CHEE-ah-moosh", example: "Nós sentíamos falta da comida de casa." },
          { form: "sentiam", meaning: "you all used to feel", pron: "sen-CHEE-ahng", example: "Vocês sentiam dificuldade no começo?" },
        ],
      },
    },
    {
      pt: "acreditar", en: "to believe", category: "Sentimentos e percepção",
      tenses: {
        presente: [
          { form: "acredito", meaning: "I believe", pron: "ah-kreh-DJEE-too", example: "Eu acredito em você." },
          { form: "acredita", meaning: "you believe", pron: "ah-kreh-DJEE-tah", example: "Você acredita em fantasma?" },
          { form: "acreditamos", meaning: "we believe", pron: "ah-kreh-djee-TAH-moosh", example: "Nós acreditamos nisso." },
          { form: "acreditam", meaning: "you all believe", pron: "ah-kreh-DJEE-tahng", example: "Vocês acreditam nessa história?" },
        ],
        perfeito: [
          { form: "acreditei", meaning: "I believed", pron: "ah-kreh-djee-TAY", example: "Eu acreditei nele na hora." },
          { form: "acreditou", meaning: "you believed", pron: "ah-kreh-djee-TOH", example: "Você acreditou no que ele falou?" },
          { form: "acreditamos", meaning: "we believed", pron: "ah-kreh-djee-TAH-moosh", example: "Nós acreditamos na promessa dele." },
          { form: "acreditaram", meaning: "you all believed", pron: "ah-kreh-djee-TAH-rahng", example: "Vocês acreditaram nessa desculpa?" },
        ],
        imperfeito: [
          { form: "acreditava", meaning: "I used to believe / was believing", pron: "ah-kreh-djee-TAH-vah", example: "Eu acreditava em tudo quando era criança." },
          { form: "acreditava", meaning: "you used to believe / were believing", pron: "ah-kreh-djee-TAH-vah", example: "Você acreditava em Papai Noel?" },
          { form: "acreditávamos", meaning: "we used to believe / were believing", pron: "ah-kreh-djee-TAH-vah-moosh", example: "Nós acreditávamos nas histórias da minha vó." },
          { form: "acreditavam", meaning: "you all used to believe / were believing", pron: "ah-kreh-djee-TAH-vahng", example: "Vocês acreditavam nisso antes?" },
        ],
      },
    },
    {
      pt: "parecer", en: "to seem, to look like", category: "Sentimentos e percepção",
      tenses: {
        presente: [
          { form: "pareço", meaning: "I seem / look like", pron: "pah-REH-soo", example: "Eu pareço cansado hoje." },
          { form: "parece", meaning: "you seem / look like", pron: "pah-REH-see", example: "Você parece preocupado, tá tudo bem?" },
          { form: "parecemos", meaning: "we seem / look like", pron: "pah-reh-SEH-moosh", example: "Nós parecemos irmãos." },
          { form: "parecem", meaning: "you all seem / look like", pron: "pah-REH-seng", example: "Vocês parecem irmãos, né?" },
        ],
        perfeito: [
          { form: "pareci", meaning: "I seemed / looked like", pron: "pah-reh-SEE", example: "Eu pareci bobo naquela hora." },
          { form: "pareceu", meaning: "you seemed / looked like", pron: "pah-reh-SEH-oo", example: "Você pareceu chateado, aconteceu algo?" },
          { form: "parecemos", meaning: "we seemed / looked like", pron: "pah-reh-SEH-moosh", example: "Nós parecemos perdidos no meio da rua." },
          { form: "pareceram", meaning: "you all seemed / looked like", pron: "pah-reh-SEH-rahng", example: "Vocês pareceram cansados depois da viagem?" },
        ],
        imperfeito: [
          { form: "parecia", meaning: "I used to seem / look like / was seeming", pron: "pah-reh-SEE-ah", example: "Eu parecia mais novo naquela foto." },
          { form: "parecia", meaning: "you used to seem / look like / were seeming", pron: "pah-reh-SEE-ah", example: "Você parecia tímido quando criança?" },
          { form: "parecíamos", meaning: "we used to seem / look like / were seeming", pron: "pah-reh-SEE-ah-moosh", example: "Nós parecíamos sempre atrasados." },
          { form: "pareciam", meaning: "you all used to seem / look like / were seeming", pron: "pah-reh-SEE-ahng", example: "Vocês pareciam irmãos de verdade?" },
        ],
      },
    },
    {
      pt: "olhar", en: "to look (at)", category: "Sentimentos e percepção",
      tenses: {
        presente: [
          { form: "olho", meaning: "I look (at)", pron: "OH-lyoo", example: "Eu olho o celular toda hora." },
          { form: "olha", meaning: "you look (at)", pron: "OH-lyah", example: "Você olha demais pro lado." },
          { form: "olhamos", meaning: "we look (at)", pron: "oh-LYAH-moosh", example: "Nós olhamos o cardápio antes de entrar." },
          { form: "olham", meaning: "you all look (at)", pron: "OH-lyahng", example: "Vocês olham as notícias de manhã?" },
        ],
        perfeito: [
          { form: "olhei", meaning: "I looked (at)", pron: "oh-LYAY", example: "Eu olhei pra ele e ri." },
          { form: "olhou", meaning: "you looked (at)", pron: "oh-LYOH", example: "Você olhou o preço antes de comprar?" },
          { form: "olhamos", meaning: "we looked (at)", pron: "oh-LYAH-moosh", example: "Nós olhamos o mapa e seguimos." },
          { form: "olharam", meaning: "you all looked (at)", pron: "oh-LYAH-rahng", example: "Vocês olharam a previsão do tempo?" },
        ],
        imperfeito: [
          { form: "olhava", meaning: "I used to look (at)", pron: "oh-LYAH-vah", example: "Eu olhava o mar da janela do quarto." },
          { form: "olhava", meaning: "you used to look (at)", pron: "oh-LYAH-vah", example: "Você olhava tudo com curiosidade." },
          { form: "olhávamos", meaning: "we used to look (at)", pron: "oh-LYAH-vah-moosh", example: "Nós olhávamos as estrelas na praia." },
          { form: "olhavam", meaning: "you all used to look (at)", pron: "oh-LYAH-vahng", example: "Vocês olhavam o jogo pela TV do bar?" },
        ],
      },
    },
    {
      pt: "ganhar", en: "to win, to earn", category: "Rotina e lazer",
      tenses: {
        presente: [
          { form: "ganho", meaning: "I win / earn", pron: "GAHN-yoo", example: "Eu ganho bem no trabalho." },
          { form: "ganha", meaning: "you win / earn", pron: "GAHN-yah", example: "Você ganha quanto por mês?" },
          { form: "ganhamos", meaning: "we win / earn", pron: "gahn-YAH-moosh", example: "Nós sempre ganhamos desconto aqui." },
          { form: "ganham", meaning: "you all win / earn", pron: "GAHN-yahng", example: "Vocês ganham sempre quando jogam juntos?" },
        ],
        perfeito: [
          { form: "ganhei", meaning: "I won / earned", pron: "gah-NYAY", example: "Eu ganhei bem no mês passado." },
          { form: "ganhou", meaning: "you won / earned", pron: "gah-NYOH", example: "Você ganhou o jogo?" },
          { form: "ganhamos", meaning: "we won / earned", pron: "gah-NYAH-moosh", example: "Nós ganhamos pontos extras." },
          { form: "ganharam", meaning: "you all won / earned", pron: "gah-NYAH-rahng", example: "Vocês ganharam o troféu?" },
        ],
        imperfeito: [
          { form: "ganhava", meaning: "I used to win / earn", pron: "gah-NYAH-vah", example: "Eu ganhava dinheiro nos trabalhos de verão." },
          { form: "ganhava", meaning: "you used to win / earn", pron: "gah-NYAH-vah", example: "Você ganhava sempre no jogo?" },
          { form: "ganhávamos", meaning: "we used to win / earn", pron: "gah-NYAH-vah-moosh", example: "Nós ganhávamos medalha na escola." },
          { form: "ganhavam", meaning: "you all used to win / earn", pron: "gah-NYAH-vahng", example: "Vocês ganhavam presentes no Natal?" },
        ],
      },
    },
    {
      pt: "perder", en: "to lose", category: "Rotina e lazer", irregular: true,
      tenses: {
        presente: [
          { form: "perco", meaning: "I lose", pron: "PEHR-koo", example: "Eu perco o ônibus toda manhã." },
          { form: "perde", meaning: "you lose", pron: "PEHR-djee", example: "Você perde quando não treina?" },
          { form: "perdemos", meaning: "we lose", pron: "pehr-DEH-moosh", example: "Nós perdemos o jogo por um gol." },
          { form: "perdem", meaning: "you all lose", pron: "PEHR-deng", example: "Vocês perdem a paciência rápido?" },
        ],
        perfeito: [
          { form: "perdi", meaning: "I lost / missed", pron: "pehr-DJEE", example: "Eu perdi o ônibus hoje cedo." },
          { form: "perdeu", meaning: "you lost / missed", pron: "pehr-DEH-oo", example: "Você perdeu o celular?" },
          { form: "perdemos", meaning: "we lost / missed", pron: "pehr-DEH-moosh", example: "Nós perdemos a partida ontem." },
          { form: "perderam", meaning: "you all lost / missed", pron: "pehr-DEH-rahng", example: "Vocês perderam o voo?" },
        ],
        imperfeito: [
          { form: "perdia", meaning: "I used to lose / was losing", pron: "per-DJEE-ah", example: "Eu perdia o ônibus às vezes." },
          { form: "perdia", meaning: "you used to lose / were losing", pron: "per-DJEE-ah", example: "Você perdia a chave com frequência?" },
          { form: "perdíamos", meaning: "we used to lose / were losing", pron: "per-DJEE-ah-moosh", example: "Nós perdíamos as partidas no começo." },
          { form: "perdiam", meaning: "you all used to lose / were losing", pron: "per-DJEE-ahng", example: "Vocês perdiam o treino quando chovia?" },
        ],
      },
    },
    {
      pt: "rir", en: "to laugh", category: "Sentimentos e percepção", irregular: true,
      tenses: {
        presente: [
          { form: "rio", meaning: "I laugh", pron: "HEE-oo", example: "Eu rio com os meus amigos." },
          { form: "ri", meaning: "you laugh", pron: "HEE", example: "Você ri muito nas festas?" },
          { form: "rimos", meaning: "we laugh", pron: "HEE-moosh", example: "Nós rimos de tudo à toa." },
          { form: "riem", meaning: "you all laugh", pron: "HEE-eng", example: "Vocês riem sempre juntos?" },
        ],
        perfeito: [
          { form: "ri", meaning: "I laughed", pron: "HEE", example: "Eu ri tanto que chorei." },
          { form: "riu", meaning: "you laughed", pron: "HEE-oo", example: "Você riu do que eu disse?" },
          { form: "rimos", meaning: "we laughed", pron: "HEE-moosh", example: "Nós rimos a noite toda." },
          { form: "riram", meaning: "you all laughed", pron: "HEE-rahng", example: "Vocês riram da piada dele?" },
        ],
        imperfeito: [
          { form: "ria", meaning: "I used to laugh / was laughing", pron: "HEE-ah", example: "Eu ria de tudo naquela época." },
          { form: "ria", meaning: "you used to laugh / were laughing", pron: "HEE-ah", example: "Você ria muito com ela?" },
          { form: "ríamos", meaning: "we used to laugh / were laughing", pron: "HEE-ah-moosh", example: "Nós ríamos de qualquer bobagem." },
          { form: "riam", meaning: "you all used to laugh", pron: "HEE-ahng", example: "Vocês riam até chorar às vezes?" },
        ],
      },
    },
    {
      pt: "sorrir", en: "to smile", category: "Sentimentos e percepção", irregular: true,
      tenses: {
        presente: [
          { form: "sorrio", meaning: "I smile", pron: "soh-HEE-oo", example: "Eu sorrio quando vejo ela." },
          { form: "sorri", meaning: "you smile", pron: "soh-HEE", example: "Você sorri nas fotos?" },
          { form: "sorrimos", meaning: "we smile", pron: "soh-HEE-moosh", example: "Nós sorrimos sem parar." },
          { form: "sorriem", meaning: "you all smile", pron: "soh-HEE-eng", example: "Vocês sorriem pouco nas fotos, né?" },
        ],
        perfeito: [
          { form: "sorri", meaning: "I smiled", pron: "soh-HEE", example: "Eu sorri quando ele chegou." },
          { form: "sorriu", meaning: "you smiled", pron: "soh-HEE-oo", example: "Você sorriu pra ela?" },
          { form: "sorrimos", meaning: "we smiled", pron: "soh-HEE-moosh", example: "Nós sorrimos na hora da foto." },
          { form: "sorriram", meaning: "you all smiled", pron: "soh-HEE-rahng", example: "Vocês sorriram quando viram o presente?" },
        ],
        imperfeito: [
          { form: "sorria", meaning: "I used to smile / was smiling", pron: "soh-HEE-ah", example: "Eu sorria muito quando era criança." },
          { form: "sorria", meaning: "you used to smile / were smiling", pron: "soh-HEE-ah", example: "Você sorria sempre nas fotos?" },
          { form: "sorríamos", meaning: "we used to smile / were smiling", pron: "soh-HEE-ah-moosh", example: "Nós sorríamos toda vez que ele falava isso." },
          { form: "sorriam", meaning: "you all used to smile / were smiling", pron: "soh-HEE-ahng", example: "Vocês sorriam bastante?" },
        ],
      },
    },
    {
      pt: "chorar", en: "to cry", category: "Sentimentos e percepção",
      tenses: {
        presente: [
          { form: "choro", meaning: "I cry", pron: "SHOH-roo", example: "Eu choro de rir às vezes." },
          { form: "chora", meaning: "you cry", pron: "SHOH-rah", example: "Você chora no cinema?" },
          { form: "choramos", meaning: "we cry", pron: "shoh-RAH-moosh", example: "Nós choramos fácil com filme triste." },
          { form: "choram", meaning: "you all cry", pron: "SHOH-rahng", example: "Vocês choram com filmes tristes?" },
        ],
        perfeito: [
          { form: "chorei", meaning: "I cried", pron: "shoh-RAY", example: "Eu chorei no final do filme." },
          { form: "chorou", meaning: "you cried", pron: "shoh-ROH", example: "Você chorou quando soube?" },
          { form: "choramos", meaning: "we cried", pron: "shoh-RAH-moosh", example: "Nós choramos de tanto rir." },
          { form: "choraram", meaning: "you all cried", pron: "shoh-RAH-rahng", example: "Vocês choraram no casamento?" },
        ],
        imperfeito: [
          { form: "chorava", meaning: "I used to cry / was crying", pron: "shoh-RAH-vah", example: "Eu chorava em todo filme triste." },
          { form: "chorava", meaning: "you used to cry / were crying", pron: "shoh-RAH-vah", example: "Você chorava quando tinha saudade?" },
          { form: "chorávamos", meaning: "we used to cry / were crying", pron: "shoh-RAH-vah-moosh", example: "Nós chorávamos de tanto rir." },
          { form: "choravam", meaning: "you all used to cry", pron: "shoh-RAH-vahng", example: "Vocês choravam por qualquer coisa?" },
        ],
      },
    },
    {
      pt: "sonhar", en: "to dream", category: "Sentimentos e percepção",
      tenses: {
        presente: [
          { form: "sonho", meaning: "I dream", pron: "SOH-nyoo", example: "Eu sonho com a praia." },
          { form: "sonha", meaning: "you dream", pron: "SOH-nyah", example: "Você sonha muito?" },
          { form: "sonhamos", meaning: "we dream", pron: "soh-NYAH-moosh", example: "Nós sonhamos em morar no Rio." },
          { form: "sonham", meaning: "you all dream", pron: "SOH-nyahng", example: "Vocês sonham com isso?" },
        ],
        perfeito: [
          { form: "sonhei", meaning: "I dreamed", pron: "soh-NYAY", example: "Eu sonhei com você ontem." },
          { form: "sonhou", meaning: "you dreamed", pron: "soh-NYOH", example: "Você sonhou alguma coisa estranha?" },
          { form: "sonhamos", meaning: "we dreamed", pron: "soh-NYAH-moosh", example: "Nós sonhamos a mesma coisa." },
          { form: "sonharam", meaning: "you all dreamed", pron: "soh-NYAH-rahng", example: "Vocês sonharam com a viagem?" },
        ],
        imperfeito: [
          { form: "sonhava", meaning: "I used to dream / was dreaming", pron: "soh-NYAH-vah", example: "Eu sonhava em ser jogador de futebol." },
          { form: "sonhava", meaning: "you used to dream / were dreaming", pron: "soh-NYAH-vah", example: "Você sonhava em morar fora?" },
          { form: "sonhávamos", meaning: "we used to dream / were dreaming", pron: "soh-NYAH-vah-moosh", example: "Nós sonhávamos com a casa na praia." },
          { form: "sonhavam", meaning: "you all used to dream / were dreaming", pron: "soh-NYAH-vahng", example: "Vocês sonhavam com isso quando eram crianças?" },
        ],
      },
    },
    {
      pt: "viver", en: "to live (to be alive)", category: "Sentimentos e percepção",
      tenses: {
        presente: [
          { form: "vivo", meaning: "I live (be alive)", pron: "VEE-voo", example: "Eu vivo bem com pouco." },
          { form: "vive", meaning: "you live (be alive)", pron: "VEE-vee", example: "Você vive pra trabalhar?" },
          { form: "vivemos", meaning: "we live (be alive)", pron: "vee-VEH-moosh", example: "Nós vivemos num país tropical." },
          { form: "vivem", meaning: "you all live (be alive)", pron: "VEE-veng", example: "Vocês vivem felizes?" },
        ],
        perfeito: [
          { form: "vivi", meaning: "I lived (be alive)", pron: "vee-VEE", example: "Eu vivi um ano fora do Brasil." },
          { form: "viveu", meaning: "you lived (be alive)", pron: "vee-VEH-oo", example: "Você viveu isso na pele?" },
          { form: "vivemos", meaning: "we lived (be alive)", pron: "vee-VEH-moosh", example: "Nós vivemos momentos ótimos juntos." },
          { form: "viveram", meaning: "you all lived (be alive)", pron: "vee-VEH-rahng", example: "Vocês viveram muita coisa juntos?" },
        ],
        imperfeito: [
          { form: "vivia", meaning: "I used to live / was living (be alive)", pron: "vee-VEE-ah", example: "Eu vivia sem preocupação naquela época." },
          { form: "vivia", meaning: "you used to live / were living (be alive)", pron: "vee-VEE-ah", example: "Você vivia bem lá?" },
          { form: "vivíamos", meaning: "we used to live / were living (be alive)", pron: "vee-VEE-ah-moosh", example: "Nós vivíamos com muito pouco." },
          { form: "viviam", meaning: "you all used to live / were living (be alive)", pron: "vee-VEE-ahng", example: "Vocês viviam juntos antes?" },
        ],
      },
    },
    {
      // "Morrer de" (medo, rir, calor, saudade) is why every person is live speech here.
      pt: "morrer", en: "to die", category: "Sentimentos e percepção",
      tenses: {
        presente: [
          { form: "morro", meaning: "I die", pron: "MOH-hoo", example: "Eu morro de medo de barata." },
          { form: "morre", meaning: "you die", pron: "MOH-hee", example: "Você morre de rir com ele, né?" },
          { form: "morremos", meaning: "we die", pron: "moh-HEH-moosh", example: "Nós morremos de calor no verão." },
          { form: "morrem", meaning: "you all die", pron: "MOH-heng", example: "Vocês morrem de saudade do Rio?" },
        ],
        perfeito: [
          { form: "morri", meaning: "I died", pron: "moh-HEE", example: "Eu quase morri de susto." },
          { form: "morreu", meaning: "you died / it died", pron: "moh-HEH-oo", example: "Seu celular morreu de novo?" },
          { form: "morremos", meaning: "we died", pron: "moh-HEH-moosh", example: "Nós morremos de rir ontem." },
          { form: "morreram", meaning: "you all died", pron: "moh-HEH-rahng", example: "Vocês morreram de frio lá?" },
        ],
        imperfeito: [
          { form: "morria", meaning: "I used to die", pron: "moh-HEE-ah", example: "Eu morria de vergonha na escola." },
          { form: "morria", meaning: "you used to die", pron: "moh-HEE-ah", example: "Você morria de medo de escuro?" },
          { form: "morríamos", meaning: "we used to die", pron: "moh-HEE-ah-moosh", example: "Nós morríamos de rir com as piadas dele." },
          { form: "morriam", meaning: "you all used to die", pron: "moh-HEE-ahng", example: "Vocês morriam de calor sem ventilador?" },
        ],
      },
    },
    {
      // The live tense is the perfeito ("eu nasci em…"). The present is a generic
      // "a gente nasce" / "bebês nascem"; the imperfeito survives only in the plural.
      pt: "nascer", en: "to be born", category: "Sentimentos e percepção",
      tenses: {
        presente: [
          { form: "nasço", meaning: "I am born (never used)", pron: "NAH-soo", example: "", quiz: false },
          { form: "nasce", meaning: "we are born (a gente)", pron: "NAH-see", example: "A gente nasce sem manual.", person: "a gente" },
          { form: "nascemos", meaning: "we are born (never used)", pron: "nah-SEH-moosh", example: "", quiz: false },
          { form: "nascem", meaning: "they are born", pron: "NAH-seng", example: "Muitos bebês nascem em setembro.", person: "eles" },
        ],
        perfeito: [
          { form: "nasci", meaning: "I was born", pron: "nah-SEE", example: "Eu nasci em Oslo, mas moro no Rio." },
          { form: "nasceu", meaning: "you were born", pron: "nah-SEH-oo", example: "Você nasceu aqui no Rio?" },
          { form: "nascemos", meaning: "we were born", pron: "nah-SEH-moosh", example: "Nós nascemos no mesmo hospital." },
          { form: "nasceram", meaning: "you all were born", pron: "nah-SEH-rahng", example: "Vocês nasceram no mesmo ano?" },
        ],
        imperfeito: [
          { form: "nascia", meaning: "I used to be born (never used)", pron: "nah-SEE-ah", example: "", quiz: false },
          { form: "nascia", meaning: "you used to be born (never used)", pron: "nah-SEE-ah", example: "", quiz: false },
          { form: "nascíamos", meaning: "we used to be born (never used)", pron: "nah-SEE-ah-moosh", example: "", quiz: false },
          { form: "nasciam", meaning: "they used to be born", pron: "nah-SEE-ahng", example: "Naquela época, eles nasciam em casa mesmo.", person: "eles" },
        ],
      },
    },
    {
      pt: "odiar", en: "to hate", category: "Sentimentos e percepção", irregular: true,
      tenses: {
        presente: [
          { form: "odeio", meaning: "I hate", pron: "oh-DAY-oo", example: "Eu odeio trânsito." },
          { form: "odeia", meaning: "you hate", pron: "oh-DAY-ah", example: "Você odeia calor?" },
          { form: "odiamos", meaning: "we hate", pron: "oh-DJAH-moosh", example: "Nós odiamos acordar cedo." },
          { form: "odeiam", meaning: "you all hate", pron: "oh-DAY-ahng", example: "Vocês odeiam fila?" },
        ],
        perfeito: [
          { form: "odiei", meaning: "I hated", pron: "oh-djee-AY", example: "Eu odiei o trânsito ontem." },
          { form: "odiou", meaning: "you hated", pron: "oh-djee-OH", example: "Você odiou a comida?" },
          { form: "odiamos", meaning: "we hated", pron: "oh-DJAH-moosh", example: "Nós odiamos esperar na fila." },
          { form: "odiaram", meaning: "you all hated", pron: "oh-djee-AH-rahng", example: "Vocês odiaram o calor no verão?" },
        ],
        imperfeito: [
          { form: "odiava", meaning: "I used to hate", pron: "oh-djee-AH-vah", example: "Eu odiava acordar cedo na escola." },
          { form: "odiava", meaning: "you used to hate", pron: "oh-djee-AH-vah", example: "Você odiava fazer dever de casa?" },
          { form: "odiávamos", meaning: "we used to hate", pron: "oh-djee-AH-vah-moosh", example: "Nós odiávamos chuva no recreio." },
          { form: "odiavam", meaning: "you all used to hate", pron: "oh-djee-AH-vahng", example: "Vocês odiavam aquela professora?" },
        ],
      },
    },
    {
      pt: "preferir", en: "to prefer", category: "Sentimentos e percepção", irregular: true,
      tenses: {
        presente: [
          { form: "prefiro", meaning: "I prefer", pron: "preh-FEE-roo", example: "Eu prefiro café sem açúcar." },
          { form: "prefere", meaning: "you prefer", pron: "preh-FEH-ree", example: "Você prefere praia ou montanha?" },
          { form: "preferimos", meaning: "we prefer", pron: "preh-feh-REE-moosh", example: "Nós preferimos comer em casa." },
          { form: "preferem", meaning: "you all prefer", pron: "preh-FEH-reng", example: "Vocês preferem ir de carro?" },
        ],
        perfeito: [
          { form: "preferi", meaning: "I preferred", pron: "preh-feh-REE", example: "Eu preferi ficar em casa ontem." },
          { form: "preferiu", meaning: "you preferred", pron: "preh-feh-REE-oo", example: "Você preferiu sair ou ficar?" },
          { form: "preferimos", meaning: "we preferred", pron: "preh-feh-REE-moosh", example: "Nós preferimos o restaurante japonês." },
          { form: "preferiram", meaning: "you all preferred", pron: "preh-feh-REE-rahng", example: "Vocês preferiram outro caminho?" },
        ],
        imperfeito: [
          { form: "preferia", meaning: "I used to prefer / was preferring", pron: "preh-feh-REE-ah", example: "Eu preferia ficar em casa no frio." },
          { form: "preferia", meaning: "you used to prefer / were preferring", pron: "preh-feh-REE-ah", example: "Você preferia chá ou café?" },
          { form: "preferíamos", meaning: "we used to prefer / were preferring", pron: "preh-feh-REE-ah-moosh", example: "Nós preferíamos almoçar fora na sexta." },
          { form: "preferiam", meaning: "you all used to prefer", pron: "preh-feh-REE-ahng", example: "Vocês preferiam viajar de carro ou de avião?" },
        ],
      },
    },
    {
      pt: "gostar", en: "to like", category: "Interação social",
      tenses: {
        presente: [
          { form: "gosto", meaning: "I like", pron: "GOH-stoo", example: "Eu gosto de música." },
          { form: "gosta", meaning: "you like", pron: "GOH-stah", example: "Você gosta de café?" },
          { form: "gostamos", meaning: "we like", pron: "goh-STAH-moosh", example: "Nós gostamos desse lugar." },
          { form: "gostam", meaning: "you all like", pron: "GOH-stahng", example: "Vocês gostam de viajar?" },
        ],
        perfeito: [
          { form: "gostei", meaning: "I liked", pron: "goh-STAY", example: "Eu gostei do filme ontem." },
          { form: "gostou", meaning: "you liked", pron: "gohs-TOH", example: "Você gostou da comida?" },
          { form: "gostamos", meaning: "we liked", pron: "gohs-TAH-moosh", example: "Nós gostamos da viagem." },
          { form: "gostaram", meaning: "you all liked", pron: "gohs-TAH-rahng", example: "Vocês gostaram da festa?" },
        ],
        imperfeito: [
          { form: "gostava", meaning: "I used to like", pron: "goh-STAH-vah", example: "Eu gostava muito de chocolate." },
          { form: "gostava", meaning: "you used to like", pron: "goh-STAH-vah", example: "Você gostava de jogar futebol?" },
          { form: "gostávamos", meaning: "we used to like", pron: "goh-STAH-vah-moosh", example: "Nós gostávamos de ir ao parque." },
          { form: "gostavam", meaning: "you all used to like", pron: "goh-STAH-vahng", example: "Vocês gostavam daquele professor?" },
        ],
        subjuntivo: [
          { form: "gostasse", meaning: "if I liked", pron: "gohs-TAH-see", example: "Se eu gostasse de festa, saía toda sexta." },
          { form: "gostasse", meaning: "if you liked", pron: "gohs-TAH-see", example: "Queria que você gostasse de samba como eu gosto." },
          { form: "gostássemos", meaning: "if we liked", pron: "gohs-TAH-seh-moosh", example: "Ela cozinhou como se nós gostássemos de comida apimentada." },
          { form: "gostassem", meaning: "if you all liked", pron: "gohs-TAH-seng", example: "Se vocês gostassem do filme, a gente via a sequência." },
        ],
      },
    },
    {
      pt: "amar", en: "to love", category: "Interação social",
      tenses: {
        presente: [
          { form: "amo", meaning: "I love", pron: "AH-moo", example: "Eu amo a minha família." },
          { form: "ama", meaning: "you love", pron: "AH-mah", example: "Você ama o Rio?" },
          { form: "amamos", meaning: "we love", pron: "ah-MAH-moosh", example: "Nós amamos morar aqui." },
          { form: "amam", meaning: "you all love", pron: "AH-mahng", example: "Vocês amam praia?" },
        ],
        perfeito: [
          { form: "amei", meaning: "I loved", pron: "ah-MAY", example: "Eu amei aquela viagem." },
          { form: "amou", meaning: "you loved", pron: "ah-MOH", example: "Você amou o filme?" },
          { form: "amamos", meaning: "we loved", pron: "ah-MAH-moosh", example: "Nós amamos a festa de ontem." },
          { form: "amaram", meaning: "you all loved", pron: "ah-MAH-rahng", example: "Vocês amaram o presente?" },
        ],
        imperfeito: [
          { form: "amava", meaning: "I used to love / was loving", pron: "ah-MAH-vah", example: "Eu amava aquele parque quando era criança." },
          { form: "amava", meaning: "you used to love / were loving", pron: "ah-MAH-vah", example: "Você amava brincar na rua?" },
          { form: "amávamos", meaning: "we used to love / were loving", pron: "ah-MAH-vah-moosh", example: "Nós amávamos passar o domingo na praia." },
          { form: "amavam", meaning: "you all used to love / were loving", pron: "ah-MAH-vahng", example: "Vocês amavam esse lugar?" },
        ],
        subjuntivo: [
          { form: "amasse", meaning: "if I loved", pron: "ah-MAH-see", example: "Se eu amasse menos essa cidade, já tinha mudado." },
          { form: "amasse", meaning: "if you loved", pron: "ah-MAH-see", example: "Queria que você amasse esse time como eu amo." },
          { form: "amássemos", meaning: "if we loved", pron: "ah-MAH-seh-moosh", example: "Ele falava como se nós amássemos trabalhar de domingo." },
          { form: "amassem", meaning: "if you all loved", pron: "ah-MAH-seng", example: "Se vocês amassem esse bairro, não iam embora." },
        ],
      },
    },
    {
      pt: "ajudar", en: "to help", category: "Interação social",
      tenses: {
        presente: [
          { form: "ajudo", meaning: "I help", pron: "ah-ZHOO-doo", example: "Eu ajudo minha mãe em casa." },
          { form: "ajuda", meaning: "you help", pron: "ah-ZHOO-dah", example: "Você ajuda seus amigos?" },
          { form: "ajudamos", meaning: "we help", pron: "ah-zhoo-DAH-moosh", example: "Nós ajudamos os vizinhos." },
          { form: "ajudam", meaning: "you all help", pron: "ah-ZHOO-dahng", example: "Vocês ajudam quando precisam?" },
        ],
        perfeito: [
          { form: "ajudei", meaning: "I helped", pron: "ah-zhoo-DAY", example: "Eu ajudei a Ana ontem." },
          { form: "ajudou", meaning: "you helped", pron: "ah-zhoo-DOH", example: "Você ajudou com a mudança?" },
          { form: "ajudamos", meaning: "we helped", pron: "ah-zhoo-DAH-moosh", example: "Nós ajudamos a montar tudo." },
          { form: "ajudaram", meaning: "you all helped", pron: "ah-zhoo-DAH-rahng", example: "Vocês ajudaram o vizinho?" },
        ],
        imperfeito: [
          { form: "ajudava", meaning: "I used to help / was helping", pron: "ah-zhoo-DAH-vah", example: "Eu ajudava a minha mãe na cozinha." },
          { form: "ajudava", meaning: "you used to help / were helping", pron: "ah-zhoo-DAH-vah", example: "Você ajudava os seus colegas na escola?" },
          { form: "ajudávamos", meaning: "we used to help / were helping", pron: "ah-zhoo-DAH-vah-moosh", example: "Nós ajudávamos a vizinha com as compras." },
          { form: "ajudavam", meaning: "you all used to help / were helping", pron: "ah-zhoo-DAH-vahng", example: "Vocês ajudavam na festa da escola?" },
        ],
        subjuntivo: [
          { form: "ajudasse", meaning: "if I helped", pron: "ah-zhoo-DAH-see", example: "Ela pediu que eu ajudasse na mudança no sábado." },
          { form: "ajudasse", meaning: "if you helped", pron: "ah-zhoo-DAH-see", example: "Se você ajudasse em casa, sua mãe reclamava menos." },
          { form: "ajudássemos", meaning: "if we helped", pron: "ah-zhoo-DAH-seh-moosh", example: "Era melhor que nós ajudássemos a organizar a festa." },
          { form: "ajudassem", meaning: "if you all helped", pron: "ah-zhoo-DAH-seng", example: "Queria que vocês ajudassem o vovô com as compras." },
        ],
      },
    },
    {
      pt: "convidar", en: "to invite", category: "Interação social",
      tenses: {
        presente: [
          { form: "convido", meaning: "I invite", pron: "kohn-VEE-doo", example: "Eu convido os meus amigos sempre." },
          { form: "convida", meaning: "you invite", pron: "kohn-VEE-dah", example: "Você convida ela pra festa?" },
          { form: "convidamos", meaning: "we invite", pron: "kohn-vee-DAH-moosh", example: "Nós convidamos todo mundo." },
          { form: "convidam", meaning: "you all invite", pron: "kohn-VEE-dahng", example: "Vocês convidam os vizinhos?" },
        ],
        perfeito: [
          { form: "convidei", meaning: "I invited", pron: "kohn-vee-DAY", example: "Eu convidei ele pro churrasco." },
          { form: "convidou", meaning: "you invited", pron: "kohn-vee-DOH", example: "Você convidou muita gente?" },
          { form: "convidamos", meaning: "we invited", pron: "kohn-vee-DAH-moosh", example: "Nós convidamos a família toda." },
          { form: "convidaram", meaning: "you all invited", pron: "kohn-vee-DAH-rahng", example: "Vocês convidaram o pessoal do trabalho?" },
        ],
        imperfeito: [
          { form: "convidava", meaning: "I used to invite / was inviting", pron: "kohn-vee-DAH-vah", example: "Eu convidava os amigos todo fim de semana." },
          { form: "convidava", meaning: "you used to invite / were inviting", pron: "kohn-vee-DAH-vah", example: "Você convidava os colegas?" },
          { form: "convidávamos", meaning: "we used to invite / were inviting", pron: "kohn-vee-DAH-vah-moosh", example: "Nós convidávamos a vizinhança pro aniversário." },
          { form: "convidavam", meaning: "you all used to invite / were inviting", pron: "kohn-vee-DAH-vahng", example: "Vocês convidavam eles sempre?" },
        ],
      },
    },
    {
      pt: "visitar", en: "to visit", category: "Interação social",
      tenses: {
        presente: [
          { form: "visito", meaning: "I visit", pron: "vee-ZEE-too", example: "Eu visito minha avó todo domingo." },
          { form: "visita", meaning: "you visit", pron: "vee-ZEE-tah", example: "Você visita seus pais com frequência?" },
          { form: "visitamos", meaning: "we visit", pron: "vee-zee-TAH-moosh", example: "Nós visitamos o Cristo com os amigos." },
          { form: "visitam", meaning: "you all visit", pron: "vee-ZEE-tahng", example: "Vocês visitam o Rio todo ano?" },
        ],
        perfeito: [
          { form: "visitei", meaning: "I visited", pron: "vee-zee-TAY", example: "Eu visitei o Pão de Açúcar ontem." },
          { form: "visitou", meaning: "you visited", pron: "vee-zee-TOH", example: "Você visitou Paraty?" },
          { form: "visitamos", meaning: "we visited", pron: "vee-zee-TAH-moosh", example: "Nós visitamos um amigo no hospital." },
          { form: "visitaram", meaning: "you all visited", pron: "vee-zee-TAH-rahng", example: "Vocês visitaram o museu novo?" },
        ],
        imperfeito: [
          { form: "visitava", meaning: "I used to visit", pron: "vee-zee-TAH-vah", example: "Eu visitava meus avós nas férias." },
          { form: "visitava", meaning: "you used to visit", pron: "vee-zee-TAH-vah", example: "Você visitava o Brasil quando criança?" },
          { form: "visitávamos", meaning: "we used to visit", pron: "vee-zee-TAH-vah-moosh", example: "Nós visitávamos a praia todo verão." },
          { form: "visitavam", meaning: "you all used to visit", pron: "vee-zee-TAH-vahng", example: "Vocês visitavam a família no Natal?" },
        ],
      },
    },
    {
      pt: "aceitar", en: "to accept", category: "Interação social",
      tenses: {
        presente: [
          { form: "aceito", meaning: "I accept", pron: "ah-SAY-too", example: "Eu aceito o convite." },
          { form: "aceita", meaning: "you accept", pron: "ah-SAY-tah", example: "Você aceita cartão de crédito?" },
          { form: "aceitamos", meaning: "we accept", pron: "ah-say-TAH-moosh", example: "Nós aceitamos a proposta." },
          { form: "aceitam", meaning: "you all accept", pron: "ah-SAY-tahng", example: "Vocês aceitam pagamento em dinheiro?" },
        ],
        perfeito: [
          { form: "aceitei", meaning: "I accepted", pron: "ah-say-TAY", example: "Eu aceitei o convite ontem." },
          { form: "aceitou", meaning: "you accepted", pron: "ah-say-TOH", example: "Você aceitou a oferta dele?" },
          { form: "aceitamos", meaning: "we accepted", pron: "ah-say-TAH-moosh", example: "Nós aceitamos o convite na semana passada." },
          { form: "aceitaram", meaning: "you all accepted", pron: "ah-say-TAH-rahng", example: "Vocês aceitaram o acordo?" },
        ],
        imperfeito: [
          { form: "aceitava", meaning: "I used to accept / was accepting", pron: "ah-say-TAH-vah", example: "Eu aceitava tudo que ele dizia." },
          { form: "aceitava", meaning: "you used to accept / were accepting", pron: "ah-say-TAH-vah", example: "Você aceitava ajuda dos outros?" },
          { form: "aceitávamos", meaning: "we used to accept / were accepting", pron: "ah-say-TAH-vah-moosh", example: "Nós aceitávamos qualquer trabalho naquela época." },
          { form: "aceitavam", meaning: "you all used to accept / were accepting", pron: "ah-say-TAH-vahng", example: "Vocês aceitavam esse tipo de coisa?" },
        ],
      },
    },
    {
      pt: "recusar", en: "to refuse", category: "Interação social",
      tenses: {
        presente: [
          { form: "recuso", meaning: "I refuse", pron: "heh-KOO-zoo", example: "Eu recuso o convite com jeitinho." },
          { form: "recusa", meaning: "you refuse", pron: "heh-KOO-zah", example: "Você recusa ajuda?" },
          { form: "recusamos", meaning: "we refuse", pron: "heh-koo-ZAH-moosh", example: "Nós recusamos a proposta." },
          { form: "recusam", meaning: "you all refuse", pron: "heh-KOO-zahng", example: "Vocês recusam qualquer ajuda?" },
        ],
        perfeito: [
          { form: "recusei", meaning: "I refused", pron: "heh-koo-ZAY", example: "Eu recusei a oferta dele." },
          { form: "recusou", meaning: "you refused", pron: "heh-koo-ZOH", example: "Você recusou o convite?" },
          { form: "recusamos", meaning: "we refused", pron: "heh-koo-ZAH-moosh", example: "Nós recusamos o acordo ontem." },
          { form: "recusaram", meaning: "you all refused", pron: "heh-koo-ZAH-rahng", example: "Vocês recusaram a comida?" },
        ],
        imperfeito: [
          { form: "recusava", meaning: "I used to refuse / was refusing", pron: "heh-koo-ZAH-vah", example: "Eu recusava sempre esse tipo de trabalho." },
          { form: "recusava", meaning: "you used to refuse / were refusing", pron: "heh-koo-ZAH-vah", example: "Você recusava os presentes dele?" },
          { form: "recusávamos", meaning: "we used to refuse / were refusing", pron: "heh-koo-ZAH-vah-moosh", example: "Nós recusávamos qualquer ajuda." },
          { form: "recusavam", meaning: "you all used to refuse / were refusing", pron: "heh-koo-ZAH-vahng", example: "Vocês recusavam os convites?" },
        ],
      },
    },
    {
      pt: "combinar", en: "to arrange", category: "Interação social",
      tenses: {
        presente: [
          { form: "combino", meaning: "I arrange", pron: "kohm-BEE-noo", example: "Eu combino tudo com ela antes." },
          { form: "combina", meaning: "you arrange", pron: "kohm-BEE-nah", example: "Você sempre combina tudo com antecedência?" },
          { form: "combinamos", meaning: "we arrange", pron: "kohm-bee-NAH-moosh", example: "Nós combinamos o horário por mensagem." },
          { form: "combinam", meaning: "you all arrange", pron: "kohm-BEE-nahng", example: "Vocês combinam de ir junto?" },
        ],
        perfeito: [
          { form: "combinei", meaning: "I arranged", pron: "kohm-bee-NAY", example: "Eu combinei de encontrar ele às oito." },
          { form: "combinou", meaning: "you arranged", pron: "kohm-bee-NOH", example: "Você combinou alguma coisa com eles?" },
          { form: "combinamos", meaning: "we arranged", pron: "kohm-bee-NAH-moosh", example: "Nós combinamos de nos ver no sábado." },
          { form: "combinaram", meaning: "you all arranged", pron: "kohm-bee-NAH-rahng", example: "Vocês combinaram o preço?" },
        ],
        imperfeito: [
          { form: "combinava", meaning: "I used to arrange / was arranging", pron: "kohm-bee-NAH-vah", example: "Eu combinava tudo por telefone antes." },
          { form: "combinava", meaning: "you used to arrange / were arranging", pron: "kohm-bee-NAH-vah", example: "Você combinava de sair toda sexta?" },
          { form: "combinávamos", meaning: "we used to arrange / were arranging", pron: "kohm-bee-NAH-vah-moosh", example: "Nós combinávamos de jogar bola no domingo." },
          { form: "combinavam", meaning: "you all used to arrange / were arranging", pron: "kohm-bee-NAH-vahng", example: "Vocês combinavam os planos juntos?" },
        ],
      },
    },
    {
      pt: "encontrar", en: "to find, to meet", category: "Interação social",
      tenses: {
        presente: [
          { form: "encontro", meaning: "I find / meet", pron: "en-KOHN-troo", example: "Eu encontro meus amigos no boteco." },
          { form: "encontra", meaning: "you find / meet", pron: "en-KOHN-trah", example: "Você encontra tudo no mercado?" },
          { form: "encontramos", meaning: "we find / meet", pron: "en-kohn-TRAH-moosh", example: "Nós sempre encontramos lugar para sentar aqui." },
          { form: "encontram", meaning: "you all find / meet", pron: "en-KOHN-trahng", example: "Vocês se encontram depois do trabalho?" },
        ],
        perfeito: [
          { form: "encontrei", meaning: "I found / met", pron: "en-kohn-TRAY", example: "Eu encontrei ela no mercado." },
          { form: "encontrou", meaning: "you found / met", pron: "en-kohn-TROH", example: "Você encontrou as chaves?" },
          { form: "encontramos", meaning: "we found / met", pron: "en-kohn-TRAH-moosh", example: "Nós encontramos um bom restaurante." },
          { form: "encontraram", meaning: "you all found / met", pron: "en-kohn-TRAH-rahng", example: "Vocês encontraram tempo para isso?" },
        ],
        imperfeito: [
          { form: "encontrava", meaning: "I used to meet / find", pron: "en-kohn-TRAH-vah", example: "Eu encontrava os meus amigos no parque." },
          { form: "encontrava", meaning: "you used to meet / find", pron: "en-kohn-TRAH-vah", example: "Você encontrava moedas no chão?" },
          { form: "encontrávamos", meaning: "we used to meet / find", pron: "en-kohn-TRAH-vah-moosh", example: "Nós encontrávamos lugar para sentar." },
          { form: "encontravam", meaning: "you all used to meet / find", pron: "en-kohn-TRAH-vahng", example: "Vocês encontravam tempo para estudar?" },
        ],
        subjuntivo: [
          { form: "encontrasse", meaning: "if I found / met", pron: "en-kohn-TRAH-see", example: "Se eu encontrasse suas chaves, te avisava na hora." },
          { form: "encontrasse", meaning: "if you found / met", pron: "en-kohn-TRAH-see", example: "Queria que você encontrasse um trabalho perto de casa." },
          { form: "encontrássemos", meaning: "if we found / met", pron: "en-kohn-TRAH-seh-moosh", example: "Era melhor que nós encontrássemos um lugar mais tranquilo." },
          { form: "encontrassem", meaning: "if you all found / met", pron: "en-kohn-TRAH-seng", example: "Vocês agiram como se encontrassem dinheiro no chão todo dia." },
        ],
      },
    },
    {
      pt: "esperar", en: "to wait, to hope", category: "Interação social",
      tenses: {
        presente: [
          { form: "espero", meaning: "I wait / hope", pron: "esh-PEH-roo", example: "Eu espero o ônibus na esquina." },
          { form: "espera", meaning: "you wait / hope", pron: "esh-PEH-rah", example: "Você espera muito tempo aqui?" },
          { form: "esperamos", meaning: "we wait / hope", pron: "esh-peh-RAH-moosh", example: "Nós sempre esperamos muito tempo na fila." },
          { form: "esperam", meaning: "you all wait / hope", pron: "esh-PEH-rahng", example: "Vocês esperam aqui ou lá fora?" },
        ],
        perfeito: [
          { form: "esperei", meaning: "I waited / hoped", pron: "es-peh-RAY", example: "Eu esperei meia hora no ponto." },
          { form: "esperou", meaning: "you waited / hoped", pron: "es-peh-ROH", example: "Você esperou a resposta?" },
          { form: "esperamos", meaning: "we waited / hoped", pron: "es-peh-RAH-moosh", example: "Nós esperamos até tarde." },
          { form: "esperaram", meaning: "you all waited / hoped", pron: "es-peh-RAH-rahng", example: "Vocês esperaram na fila?" },
        ],
        imperfeito: [
          { form: "esperava", meaning: "I used to wait / hope", pron: "es-peh-RAH-vah", example: "Eu esperava o ônibus todo dia na mesma parada." },
          { form: "esperava", meaning: "you used to wait / hope", pron: "es-peh-RAH-vah", example: "Você esperava a sua mãe na porta da escola?" },
          { form: "esperávamos", meaning: "we used to wait / hope", pron: "es-peh-RAH-vah-moosh", example: "Nós esperávamos o filme começar." },
          { form: "esperavam", meaning: "you all used to wait / hope", pron: "es-peh-RAH-vahng", example: "Vocês esperavam muito tempo no banco?" },
        ],
        subjuntivo: [
          { form: "esperasse", meaning: "if I waited / hoped", pron: "es-peh-RAH-see", example: "Se eu esperasse mais um pouco, pegava o ônibus das oito." },
          { form: "esperasse", meaning: "if you waited / hoped", pron: "es-peh-RAH-see", example: "Queria que você esperasse a gente na saída do metrô." },
          { form: "esperássemos", meaning: "if we waited / hoped", pron: "es-peh-RAH-seh-moosh", example: "Era melhor que nós esperássemos a chuva passar primeiro." },
          { form: "esperassem", meaning: "if you all waited / hoped", pron: "es-peh-RAH-seng", example: "Cheguei antes que vocês esperassem demais por mim." },
        ],
      },
    },
    {
      pt: "seguir", en: "to follow", category: "Interação social", irregular: true,
      tenses: {
        presente: [
          { form: "sigo", meaning: "I follow", pron: "SEE-goo", example: "Eu sigo reto até o sinal." },
          { form: "segue", meaning: "you follow", pron: "SEH-ghee", example: "Você segue ele nas redes sociais?" },
          { form: "seguimos", meaning: "we follow", pron: "seh-GHEE-moosh", example: "Nós seguimos o caminho errado." },
          { form: "seguem", meaning: "you all follow", pron: "SEH-gheng", example: "Vocês seguem as instruções?" },
        ],
        perfeito: [
          { form: "segui", meaning: "I followed", pron: "seh-GEE", example: "Eu segui as instruções do manual." },
          { form: "seguiu", meaning: "you followed", pron: "seh-GEE-oo", example: "Você seguiu o conselho dela?" },
          { form: "seguimos", meaning: "we followed", pron: "seh-GEE-moosh", example: "Nós seguimos o grupo pela trilha." },
          { form: "seguiram", meaning: "you all followed", pron: "seh-GEE-rahng", example: "Vocês seguiram o roteiro planejado?" },
        ],
        imperfeito: [
          { form: "seguia", meaning: "I used to follow / was following", pron: "seh-GEE-ah", example: "Eu seguia as instruções à risca." },
          { form: "seguia", meaning: "you used to follow / were following", pron: "seh-GEE-ah", example: "Você seguia as notícias com atenção?" },
          { form: "seguíamos", meaning: "we used to follow / were following", pron: "seh-GEE-ah-moosh", example: "Nós seguíamos a mesma rotina todo dia." },
          { form: "seguiam", meaning: "you all used to follow", pron: "seh-GEE-ahng", example: "Vocês seguiam as redes sociais dela?" },
        ],
      },
    },
    {
      pt: "agradecer", en: "to thank", category: "Interação social",
      tenses: {
        presente: [
          { form: "agradeço", meaning: "I thank", pron: "ah-grah-DEH-soo", example: "Eu agradeço pela ajuda." },
          { form: "agradece", meaning: "you thank", pron: "ah-grah-DEH-see", example: "Você agradece sempre ao garçom?" },
          { form: "agradecemos", meaning: "we thank", pron: "ah-grah-deh-SEH-moosh", example: "Nós agradecemos o convite." },
          { form: "agradecem", meaning: "you all thank", pron: "ah-grah-DEH-seng", example: "Vocês agradecem de coração?" },
        ],
        perfeito: [
          { form: "agradeci", meaning: "I thanked", pron: "ah-grah-deh-SEE", example: "Eu agradeci pelo presente ontem." },
          { form: "agradeceu", meaning: "you thanked", pron: "ah-grah-deh-SEH-oo", example: "Você agradeceu ao motorista?" },
          { form: "agradecemos", meaning: "we thanked", pron: "ah-grah-deh-SEH-moosh", example: "Nós agradecemos a todos depois da festa." },
          { form: "agradeceram", meaning: "you all thanked", pron: "ah-grah-deh-SEH-rahng", example: "Vocês agradeceram pela comida?" },
        ],
        imperfeito: [
          { form: "agradecia", meaning: "I used to thank / was thanking", pron: "ah-grah-deh-SEE-ah", example: "Eu agradecia sempre que alguém me ajudava." },
          { form: "agradecia", meaning: "you used to thank / were thanking", pron: "ah-grah-deh-SEE-ah", example: "Você agradecia os elogios?" },
          { form: "agradecíamos", meaning: "we used to thank / were thanking", pron: "ah-grah-deh-SEE-ah-moosh", example: "Nós agradecíamos os presentes na hora." },
          { form: "agradeciam", meaning: "you all used to thank / were thanking", pron: "ah-grah-deh-SEE-ahng", example: "Vocês agradeciam desse jeito antes?" },
        ],
      },
    },
    {
      pt: "desculpar", en: "to forgive, to excuse", category: "Interação social",
      tenses: {
        presente: [
          { form: "desculpo", meaning: "I forgive / excuse", pron: "dehsh-KOOL-poo", example: "Eu desculpo o atraso dele." },
          { form: "desculpa", meaning: "you forgive / excuse", pron: "dehsh-KOOL-pah", example: "Você desculpa esse tipo de erro?" },
          { form: "desculpamos", meaning: "we forgive / excuse", pron: "dehsh-kool-PAH-moosh", example: "Nós desculpamos a demora." },
          { form: "desculpam", meaning: "you all forgive / excuse", pron: "dehsh-KOOL-pahng", example: "Vocês desculpam ele?" },
        ],
        perfeito: [
          { form: "desculpei", meaning: "I forgave / excused", pron: "dehsh-kool-PAY", example: "Eu desculpei o atraso dela." },
          { form: "desculpou", meaning: "you forgave / excused", pron: "dehsh-kool-POH", example: "Você desculpou ele depois?" },
          { form: "desculpamos", meaning: "we forgave / excused", pron: "dehsh-kool-PAH-moosh", example: "Nós desculpamos o erro do garçom." },
          { form: "desculparam", meaning: "you all forgave / excused", pron: "dehsh-kool-PAH-rahng", example: "Vocês desculparam a confusão?" },
        ],
        imperfeito: [
          { form: "desculpava", meaning: "I used to forgive / excuse / was forgiving", pron: "dehsh-kool-PAH-vah", example: "Eu desculpava tudo que ele fazia." },
          { form: "desculpava", meaning: "you used to forgive / excuse / were forgiving", pron: "dehsh-kool-PAH-vah", example: "Você desculpava os atrasos dele?" },
          { form: "desculpávamos", meaning: "we used to forgive / excuse / were forgiving", pron: "dehsh-kool-PAH-vah-moosh", example: "Nós desculpávamos esse tipo de coisa." },
          { form: "desculpavam", meaning: "you all used to forgive / excuse / were forgiving", pron: "dehsh-kool-PAH-vahng", example: "Vocês desculpavam ela sempre?" },
        ],
      },
    },
    {
      pt: "marcar", en: "to schedule, to mark", category: "Interação social",
      tenses: {
        presente: [
          { form: "marco", meaning: "I schedule", pron: "MAR-koo", example: "Eu marco uma consulta hoje." },
          { form: "marca", meaning: "you schedule", pron: "MAR-kah", example: "Você marca um horário lá?" },
          { form: "marcamos", meaning: "we schedule", pron: "mar-KAH-moosh", example: "Nós marcamos pra sexta-feira." },
          { form: "marcam", meaning: "you all schedule", pron: "MAR-kahng", example: "Vocês marcam o encontro hoje?" },
        ],
        perfeito: [
          { form: "marquei", meaning: "I scheduled / marked", pron: "mahr-KAY", example: "Eu marquei uma consulta para amanhã." },
          { form: "marcou", meaning: "you scheduled / marked", pron: "mahr-KOH", example: "Você marcou o encontro com o cliente?" },
          { form: "marcamos", meaning: "we scheduled / marked", pron: "mahr-KAH-moosh", example: "Nós marcamos o jantar para as oito." },
          { form: "marcaram", meaning: "you all scheduled / marked", pron: "mahr-KAH-rahng", example: "Vocês marcaram o lugar na agenda?" },
        ],
        imperfeito: [
          { form: "marcava", meaning: "I used to schedule / book / was scheduling", pron: "mahr-KAH-vah", example: "Eu marcava as reuniões com antecedência." },
          { form: "marcava", meaning: "you used to schedule / book / were scheduling", pron: "mahr-KAH-vah", example: "Você marcava consulta com frequência?" },
          { form: "marcávamos", meaning: "we used to schedule / book / were scheduling", pron: "mahr-KAH-vah-moosh", example: "Nós marcávamos encontros todo domingo." },
          { form: "marcavam", meaning: "you all used to schedule / book", pron: "mahr-KAH-vahng", example: "Vocês marcavam hora no restaurante?" },
        ],
      },
    },
  ],
};
