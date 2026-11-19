// The Imperativo tab: commands, to one person (você) and to a group (vocês).
//
// No forms are stored here. js/data/verbs.js stays the source of truth: the
// SPOKEN command to one person is the presente você form (fala, vem, faz — what
// Rio actually says), the TEXTBOOK one is the present subjunctive (fale, venha,
// faça), and the command to a group is the present subjunctive vocês form
// (falem). topics.js looks all three up by `verb`, pronunciation included, so
// every verb here must be one of the 58 that carry "subjuntivo-presente".
//
//   verb     the infinitive, as in verbs.js
//   en       the English command; `note` qualifies it where two verbs would
//            otherwise share a prompt (Take! → pegar / levar / tomar)
//   sg       example with the SPOKEN você form (the textbook form when
//            `spoken: false`); the textbook face's example is this sentence
//            with the form swapped, so the form must stand as a word of its own
//   pl       example with the vocês form
//   spoken   false where the presente form is never a command: nobody says
//            "é!" or "está!" — seja / esteja do both jobs
//
// Left out on purpose: verbs nobody orders anyone to do (poder, querer, dever,
// precisar, acontecer, existir, gostar, conseguir…).
window.DATA_IMPERATIVO = {
  cards: [
    // Essenciais
    { verb: "ser", en: "Be!", note: "permanent", spoken: false,
      sg: "Seja bem-vindo ao Rio!", pl: "Sejam sinceros comigo." },
    { verb: "estar", en: "Be!", note: "temporary / somewhere", spoken: false,
      sg: "Esteja pronto às oito.", pl: "Estejam aqui amanhã cedo." },
    { verb: "ter", en: "Have!",
      sg: "Tem paciência, que já vai chegar.", pl: "Tenham cuidado na estrada." },
    { verb: "ir", en: "Go!",
      sg: "Vai pra casa descansar.", pl: "Vão na frente, que eu já chego." },
    { verb: "vir", en: "Come!",
      sg: "Vem cá um minutinho.", pl: "Venham jantar aqui em casa." },
    { verb: "fazer", en: "Do! / Make!",
      sg: "Faz um café pra gente.", pl: "Façam fila, por favor." },
    { verb: "dar", en: "Give!",
      sg: "Me dá um copo d'água, por favor.", pl: "Deem uma olhada nisso aqui." },
    { verb: "ver", en: "See!",
      sg: "Vê se me liga mais tarde.", pl: "Vejam que vista linda!" },
    { verb: "ficar", en: "Stay!",
      sg: "Fica mais um pouco!", pl: "Fiquem à vontade." },

    // Modais e cognitivos
    { verb: "pensar", en: "Think!",
      sg: "Pensa bem antes de responder.", pl: "Pensem com calma na proposta." },
    { verb: "lembrar", en: "Remember!",
      sg: "Lembra de trancar a porta.", pl: "Lembrem de trazer o documento." },

    // Vida diária e mobilidade
    { verb: "trabalhar", en: "Work!",
      sg: "Trabalha menos e curte mais a vida.", pl: "Trabalhem em equipe." },
    { verb: "estudar", en: "Study!",
      sg: "Estuda um pouco todo dia.", pl: "Estudem pra prova de amanhã." },
    { verb: "chegar", en: "Arrive!",
      sg: "Chega cedo amanhã, tá?", pl: "Cheguem meia hora antes do show." },
    { verb: "sair", en: "Leave! / Go out!",
      sg: "Sai daí, que é perigoso!", pl: "Saiam pela porta dos fundos." },
    { verb: "pegar", en: "Grab! / Take!", note: "bus, Uber",
      sg: "Pega um casaco, que tá frio.", pl: "Peguem o metrô, é mais rápido." },
    { verb: "levar", en: "Take along! / Carry!",
      sg: "Leva um guarda-chuva.", pl: "Levem protetor solar pra praia." },
    { verb: "voltar", en: "Come back!",
      sg: "Volta logo!", pl: "Voltem sempre!" },

    // Comunicação
    { verb: "ligar", en: "Call!", note: "phone",
      sg: "Me liga quando chegar.", pl: "Liguem pra mim se precisarem." },
    { verb: "falar", en: "Speak!",
      sg: "Fala mais devagar, por favor.", pl: "Falem baixo, que o bebê tá dormindo." },
    { verb: "dizer", en: "Say! / Tell!",
      sg: "Me diz uma coisa.", pl: "Digam a verdade pra ela." },
    { verb: "perguntar", en: "Ask!", note: "a question",
      sg: "Pergunta pro garçom.", pl: "Perguntem na recepção." },
    { verb: "entender", en: "Understand!",
      sg: "Entende uma coisa: eu não vou.", pl: "Entendam, não é culpa de ninguém." },
    { verb: "aprender", en: "Learn!",
      sg: "Aprende com os erros.", pl: "Aprendam a dividir as coisas." },

    // Consumo e serviços
    { verb: "comprar", en: "Buy!",
      sg: "Compra pão na volta.", pl: "Comprem os ingressos antes." },
    { verb: "pagar", en: "Pay!",
      sg: "Paga no caixa, por favor.", pl: "Paguem no Pix, que é mais fácil." },
    { verb: "pedir", en: "Order! / Ask for!",
      sg: "Pede a conta, por favor.", pl: "Peçam uma porção de batata frita." },
    { verb: "abrir", en: "Open!",
      sg: "Abre a janela, que tá calor.", pl: "Abram o livro na página dez." },

    // Rotina e lazer
    { verb: "comer", en: "Eat!",
      sg: "Come devagar.", pl: "Comam à vontade." },
    { verb: "tomar", en: "Take!", note: "a shower, a coffee",
      sg: "Toma um café comigo.", pl: "Tomem cuidado na rua." },
    { verb: "dormir", en: "Sleep!",
      sg: "Dorme bem!", pl: "Durmam cedo hoje." },
    { verb: "ler", en: "Read!",
      sg: "Lê isso aqui pra mim.", pl: "Leiam com atenção." },

    // Ações do dia a dia
    { verb: "começar", en: "Start!",
      sg: "Começa pelo mais fácil.", pl: "Comecem sem mim." },
    { verb: "tentar", en: "Try!",
      sg: "Tenta de novo.", pl: "Tentem chegar na hora." },
    { verb: "trazer", en: "Bring!",
      sg: "Traz um casaco pra mim.", pl: "Tragam alguma coisa pra beber." },
    { verb: "deixar", en: "Leave it! / Let!",
      sg: "Deixa comigo!", pl: "Deixem as malas aqui." },
    { verb: "passar", en: "Pass!",
      sg: "Me passa o sal, por favor.", pl: "Passem lá em casa mais tarde." },
    { verb: "parar", en: "Stop!",
      sg: "Para com isso!", pl: "Parem de brigar!" },
    { verb: "mudar", en: "Change!",
      sg: "Muda de assunto, vai.", pl: "Mudem de lugar, por favor." },

    // Sentimentos e percepção
    { verb: "sentir", en: "Feel!",
      sg: "Sente o cheiro desse café.", pl: "Sintam a brisa do mar." },
    { verb: "viver", en: "Live!", note: "life",
      sg: "Vive a vida!", pl: "Vivam o momento." },

    // Interação social
    { verb: "ajudar", en: "Help!",
      sg: "Me ajuda aqui, por favor.", pl: "Ajudem a mãe de vocês." },
    { verb: "encontrar", en: "Find! / Meet!",
      sg: "Me encontra na praça às oito.", pl: "Encontrem um lugar pra sentar." },
    { verb: "esperar", en: "Wait!",
      sg: "Espera um pouquinho.", pl: "Esperem aqui, que eu já volto." },
  ],
};
