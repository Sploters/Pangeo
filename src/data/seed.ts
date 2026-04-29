export type CommunicativeFunction =
  | 'agreeing'
  | 'disagreeing'
  | 'buying-time'
  | 'softening'
  | 'storytelling'
  | 'clarifying'
  | 'reacting'
  | 'transitioning'
  | 'emphasizing';

export const COMMUNICATIVE_FUNCTIONS: { id: CommunicativeFunction; lbl: string; emoji: string }[] = [
  { id: 'agreeing',     lbl: 'Concordar',     emoji: '👍' },
  { id: 'disagreeing',  lbl: 'Discordar',     emoji: '🤔' },
  { id: 'buying-time',  lbl: 'Ganhar tempo',  emoji: '⏳' },
  { id: 'softening',    lbl: 'Suavizar',      emoji: '🫧' },
  { id: 'storytelling', lbl: 'Narrar',        emoji: '📖' },
  { id: 'clarifying',   lbl: 'Esclarecer',   emoji: '🔍' },
  { id: 'reacting',     lbl: 'Reagir',        emoji: '⚡' },
  { id: 'transitioning',lbl: 'Transitar',     emoji: '↪️' },
  { id: 'emphasizing',  lbl: 'Enfatizar',     emoji: '🎯' },
];

export type ConnectedSpeechPhenomenon = 'linking' | 'assimilation' | 'elision' | 'intrusion';

export type ConnectedSpeechItem = {
  phenomenon: ConnectedSpeechPhenomenon;
  full: string;
  connected: string;
  phon: string;
  example: string;
  tip: string;
};

export type VaultItem = {
  id: number;
  term: string;
  type: 'phrase' | 'phonetic' | 'reduction' | 'collocation' | 'idiom' | 'gap-filler' | 'word' | 'chunk';
  lang: string;
  gloss: string;
  source: string;
  date: string;
  example: string;
  srs: 'due' | 'learning' | 'mature' | 'new';
  strength: number;
  tags: string[];
  function?: CommunicativeFunction;
  level?: string;          // nível CEFR: A1 | A2 | B1 | B2 | C1 | C2
  // FSRS
  stability: number;      // dias até 90% retenção (0 = nunca revisado)
  difficulty: number;     // dificuldade 1-10 (padrão 5)
  lapses: number;         // vezes que esqueceu
  lastReviewAt: number;   // timestamp ms (0 = nunca revisado)
  nextReviewAt: number;   // timestamp ms (0 = vence agora)
};

export type ContentItem = {
  id: string;
  kind: 'podcast' | 'book' | 'video' | 'article';
  title: string;
  author: string;
  minutes: number | string;
  level: string;
  match: number;
  art: string;
  why: string;
  tags: string[];
  vocabulary?: VocabSuggestion[];   // ← new
};

export type VocabSuggestion = {
  term: string;
  type: VaultItem['type'];
  gloss: string;
  example?: string;
  source: string;
  level?: string;
  function?: CommunicativeFunction;
};

export type NewsArticle = {
  id: string;
  title: string;
  level: 1 | 2 | 3;
  topic: string;
  date: string;
  text: string;
  vocabulary: VocabSuggestion[];
};

export type TranscriptToken = {
  w: string;
  t: number;
  flag?: 'schwa' | 'reduce' | 'link' | 'stress';
  punct?: boolean;
};

export type SRSCard = {
  id: number;
  front: string;
  back: string;
  example: string;
  phon: string;
  level: 'learning' | 'mature' | 'due' | 'new';
};

export type ZipfWord = {
  rank: number;
  word: string;
  type: VaultItem['type'];
  gloss: string;
  example: string;
};

export type SchwaWord = {
  word: string;
  ipa: string;
  schwas: number[];
};

export type GrammarLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type GrammarTopic = {
  id: string;
  level: GrammarLevel;
  title: string;
  description: string;
  url: string;
  lessonNumber: number;
  minWords: number;
  difficultyTags: string[];
};

export type Reduction = {
  full: string;
  reduced: string;
  phon: string;
};

export const VAULT: VaultItem[] = [
  { id:1, term:'to come up with', type:'phrase', lang:'en→pt', gloss:'inventar, bolar, ter uma ideia', source:'Lex Fridman #418', date:'hoje · 14:22', example:'She came up with a brilliant solution.', srs:'due', strength:0.2, tags:['business','conversation'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
  { id:2, term:'schwa', type:'phonetic', lang:'en', gloss:'som vocálico neutro /ə/, o mais frequente do inglês', source:'Pronunciation Lesson 03', date:'hoje · 11:08', example:'banana → /bəˈnænə/', srs:'learning', strength:0.6, tags:['pronunciation'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
  { id:3, term:'gonna', type:'reduction', lang:'en', gloss:"forma reduzida de 'going to'", source:'Friends S03E14', date:'ontem · 21:50', example:"I'm gonna grab a coffee.", srs:'due', strength:0.4, tags:['reductions','casual'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
  { id:4, term:'to look forward to', type:'collocation', lang:'en→pt', gloss:'estar ansioso por, aguardar com expectativa', source:'Email do Diego', date:'ontem · 17:31', example:'I look forward to hearing from you.', srs:'mature', strength:0.92, tags:['business','email'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
  { id:5, term:'you know what I mean?', type:'gap-filler', lang:'en', gloss:'tipo, sabe? — usado para enfatizar ou pedir confirmação', source:'Huberman Podcast', date:'2 dias atrás', example:"It's tricky, you know what I mean?", srs:'learning', strength:0.55, tags:['conversation','filler'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
  { id:6, term:'on the fence', type:'idiom', lang:'en→pt', gloss:'em cima do muro, indeciso', source:'NYT artigo', date:'3 dias atrás', example:"I'm still on the fence about the offer.", srs:'due', strength:0.3, tags:['idioms'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
  { id:7, term:'heads up', type:'phrase', lang:'en→pt', gloss:'aviso, alerta antecipado', source:'Slack — work', date:'3 dias atrás', example:'Just a heads up — the meeting moved.', srs:'mature', strength:0.88, tags:['business','slack'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
  { id:8, term:'wanna', type:'reduction', lang:'en', gloss:"forma reduzida de 'want to'", source:'The Office', date:'4 dias atrás', example:'Do you wanna grab lunch?', srs:'mature', strength:0.95, tags:['reductions','casual'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
  { id:9, term:'tackle a problem', type:'collocation', lang:'en→pt', gloss:'enfrentar / lidar com um problema', source:'HBR article', date:'5 dias atrás', example:"Let's tackle this problem head-on.", srs:'learning', strength:0.5, tags:['business'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
  { id:10, term:'reckon', type:'word', lang:'en→pt', gloss:"achar, supor (BrE informal)", source:'BBC podcast', date:'5 dias atrás', example:"I reckon it's gonna rain.", srs:'learning', strength:0.45, tags:['british'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
  { id:11, term:'to be on top of things', type:'phrase', lang:'en→pt', gloss:'estar com tudo sob controle', source:'meeting notes', date:'6 dias atrás', example:"She's really on top of things this week.", srs:'due', strength:0.35, tags:['business'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
  { id:12, term:'actually', type:'gap-filler', lang:'en', gloss:'na verdade — também usado como suavizador', source:'podcast', date:'1 sem atrás', example:'Actually, I disagree.', srs:'mature', strength:0.9, tags:['filler'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
];

export const CONTENT: ContentItem[] = [
  {
    id: 'c1',
    kind: 'podcast',
    title: 'How to Learn Anything Faster',
    author: 'Andrew Huberman',
    minutes: 42,
    level: 'B2',
    match: 96,
    art: '#3D7B8C',
    why: 'Vocabulário 92% conhecido · 3 collocations novas',
    tags: ['neuroscience', 'self-improvement'],
    vocabulary: [
      { term: 'fascinating', type: 'word', gloss: 'fascinante / muito interessante', example: 'That\'s a fascinating perspective.', source: 'How to Learn Anything Faster' },
      { term: 'break it down', type: 'chunk', gloss: 'explicar passo a passo / detalhar', example: 'Let me break it down for you.', source: 'How to Learn Anything Faster', function: 'clarifying' },
      { term: 'at the end of the day', type: 'chunk', gloss: 'no fim das contas / em última análise', example: 'At the end of the day, it\'s about results.', source: 'How to Learn Anything Faster', function: 'emphasizing' },
      { term: 'dive deep into', type: 'chunk', gloss: 'mergulhar fundo em / explorar a fundo', example: 'We\'re going to dive deep into AI today.', source: 'How to Learn Anything Faster', function: 'storytelling' },
      { term: 'compelling', type: 'word', gloss: 'convincente / irresistível / muito bom', example: 'That\'s a compelling argument.', source: 'How to Learn Anything Faster' },
      { term: 'nuanced', type: 'word', gloss: 'cheio de nuances / sutil / não simplista', example: 'This is a very nuanced topic.', source: 'How to Learn Anything Faster' },
      { term: 'ground-breaking', type: 'collocation', gloss: 'revolucionário / pioneiro', example: 'Ground-breaking research in the field.', source: 'How to Learn Anything Faster' },
      { term: 'in terms of', type: 'chunk', gloss: 'em termos de / no que diz respeito a', example: 'In terms of impact, it\'s huge.', source: 'How to Learn Anything Faster', function: 'clarifying' },
    ],
  },
  {
    id: 'c2',
    kind: 'book',
    title: 'The Pragmatic Thinker',
    author: 'Margaret Yu',
    minutes: '186 pp',
    level: 'B2',
    match: 91,
    art: '#2D5A3D',
    why: 'Construído sobre 200 palavras Zipf que você já domina',
    tags: ['non-fiction', 'essays'],
    vocabulary: [
      { term: 'pragmatic', type: 'word', gloss: 'pragmático / focado em resultados práticos', example: 'We need a pragmatic approach.', source: 'The Pragmatic Thinker' },
      { term: 'mental models', type: 'collocation', gloss: 'modelos mentais', example: 'Build better mental models.', source: 'The Pragmatic Thinker' },
      { term: 'trade-off', type: 'word', gloss: 'compensação / escolha difícil entre duas opções', example: 'There is always a trade-off.', source: 'The Pragmatic Thinker' },
      { term: 'framework', type: 'word', gloss: 'estrutura / arcabouço / sistema de trabalho', example: 'A new framework for thinking.', source: 'The Pragmatic Thinker' },
      { term: 'bottleneck', type: 'word', gloss: 'gargalo / ponto de obstrução', example: 'Identify the bottleneck in your process.', source: 'The Pragmatic Thinker' },
    ],
  },
  {
    id: 'c3',
    kind: 'video',
    title: 'A Walk Through Edinburgh',
    author: 'Easy English',
    minutes: 18,
    level: 'B1+',
    match: 89,
    art: '#D4A24C',
    why: 'Sotaque escocês — exposição que falta no seu perfil',
    tags: ['immersion', 'travel'],
    vocabulary: [
      { term: 'stunning', type: 'word', gloss: 'maravilhoso / deslumbrante', example: 'The view from the castle is stunning.', source: 'A Walk Through Edinburgh' },
      { term: 'cobbled streets', type: 'collocation', gloss: 'ruas de paralelepípedo', example: 'Walking through the cobbled streets.', source: 'A Walk Through Edinburgh' },
      { term: 'landmark', type: 'word', gloss: 'marco / ponto turístico importante', example: 'The monument is a famous landmark.', source: 'A Walk Through Edinburgh' },
      { term: 'vibrant', type: 'word', gloss: 'vibrante / cheio de vida', example: 'The city has a vibrant atmosphere.', source: 'A Walk Through Edinburgh' },
      { term: 'steep', type: 'word', gloss: 'íngreme / acentuado', example: 'The hill is very steep.', source: 'A Walk Through Edinburgh' },
    ],
  },
  {
    id: 'c4',
    kind: 'article',
    title: 'Why we yawn — and why it spreads',
    author: 'The Atlantic',
    minutes: 7,
    level: 'B2',
    match: 94,
    art: '#E8704C',
    why: 'Tópico de ciência popular · linguagem natural',
    tags: ['science', 'short-read'],
    vocabulary: [
      { term: 'contagious', type: 'word', gloss: 'contagioso', example: 'Yawning is highly contagious.', source: 'Why we yawn' },
      { term: 'empathy', type: 'word', gloss: 'empatia', example: 'Empathy plays a role in yawning.', source: 'Why we yawn' },
      { term: 'evolutionary', type: 'word', gloss: 'evolucionário', example: 'An evolutionary perspective on behavior.', source: 'Why we yawn' },
      { term: 'physiological', type: 'word', gloss: 'fisiológico', example: 'A physiological response to tiredness.', source: 'Why we yawn' },
      { term: 'trigger', type: 'word', gloss: 'desencadear / gatilho', example: 'What triggers a yawn?', source: 'Why we yawn' },
    ],
  },
  {
    id: 'c5',
    kind: 'podcast',
    title: 'Conversations with Tyler #201',
    author: 'Tyler Cowen',
    minutes: 64,
    level: 'C1',
    match: 78,
    art: '#6A4E3C',
    why: 'Push level — 14% palavras novas (zona ideal)',
    tags: ['economics', 'interview'],
    vocabulary: [
      { term: 'incentives', type: 'word', gloss: 'incentivos', example: 'Economic incentives drive behavior.', source: 'Conversations with Tyler' },
      { term: 'status quo', type: 'phrase', gloss: 'o estado atual das coisas', example: 'Challenging the status quo.', source: 'Conversations with Tyler' },
      { term: 'innovation', type: 'word', gloss: 'inovação', example: 'A culture of innovation.', source: 'Conversations with Tyler' },
      { term: 'disruption', type: 'word', gloss: 'disrupção / interrupção brusca', example: 'Technological disruption in markets.', source: 'Conversations with Tyler' },
      { term: 'paradigm shift', type: 'collocation', gloss: 'mudança de paradigma', example: 'We are seeing a paradigm shift.', source: 'Conversations with Tyler' },
    ],
  },
  {
    id: 'c6',
    kind: 'video',
    title: 'Cooking Risotto · slow English',
    author: 'Spoon Fork Bacon',
    minutes: 11,
    level: 'B1',
    match: 92,
    art: '#A86B3C',
    why: 'Imperativo + culinária = vocabulário do dia a dia',
    tags: ['food', 'immersion'],
    vocabulary: [
      { term: 'simmer', type: 'word', gloss: 'cozinhar em fogo baixo / fervilhar', example: 'Let it simmer for 20 minutes.', source: 'Cooking Risotto' },
      { term: 'stir', type: 'word', gloss: 'mexer / misturar', example: 'Stir the risotto constantly.', source: 'Cooking Risotto' },
      { term: 'broth', type: 'word', gloss: 'caldo', example: 'Add the chicken broth slowly.', source: 'Cooking Risotto' },
      { term: 'clove of garlic', type: 'collocation', gloss: 'dente de alho', example: 'Finely mince one clove of garlic.', source: 'Cooking Risotto' },
      { term: 'tender', type: 'word', gloss: 'macio / tenro', example: 'Cook until the rice is tender.', source: 'Cooking Risotto' },
    ],
  },
];

export const SHADOW_TRANSCRIPT: TranscriptToken[] = [
  { w:'So', t:0.0 },
  { w:'the', t:0.18, flag:'schwa' },
  { w:'thing', t:0.42, flag:'stress' },
  { w:'is', t:0.7 },
  { w:',', t:0.9, punct:true },
  { w:'when', t:1.0 },
  { w:'you', t:1.18, flag:'reduce' },
  { w:'start', t:1.4, flag:'stress' },
  { w:'learning', t:1.85, flag:'stress' },
  { w:'a', t:2.25, flag:'schwa' },
  { w:'new', t:2.4 },
  { w:'language', t:2.65, flag:'stress' },
  { w:',', t:3.05, punct:true },
  { w:'you', t:3.2, flag:'reduce' },
  { w:'gotta', t:3.4, flag:'reduce' },
  { w:'focus', t:3.75, flag:'stress' },
  { w:'on', t:4.05, flag:'schwa' },
  { w:'the', t:4.18, flag:'schwa' },
  { w:'sounds', t:4.35, flag:'stress' },
  { w:',', t:4.7, punct:true },
  { w:'not', t:4.85 },
  { w:'the', t:5.05, flag:'schwa' },
  { w:'spelling', t:5.22, flag:'stress' },
  { w:'.', t:5.6, punct:true },
];

export const SRS_DECK: SRSCard[] = [
  { id:1, front:'to pull off', back:'conseguir executar com sucesso (algo difícil)', example:'He pulled off the deal at the last minute.', phon:'/pʊl ɒf/', level:'learning' },
  { id:2, front:'upbeat', back:'animado, otimista, alto-astral', example:'She has such an upbeat personality.', phon:'/ˈʌp.biːt/', level:'mature' },
  { id:3, front:'to wrap up', back:'finalizar, concluir', example:"Let's wrap up this meeting.", phon:'/ræp ʌp/', level:'due' },
  { id:4, front:'a stretch', back:'um exagero, uma forçação', example:'Calling it the best is a stretch.', phon:'/strɛtʃ/', level:'learning' },
  { id:5, front:'to chip in', back:'contribuir, dar uma ajuda (dinheiro/esforço)', example:'Everyone chipped in for the gift.', phon:'/tʃɪp ɪn/', level:'new' },
];

export const ZIPF_TOP_500: ZipfWord[] = [
  { rank: 1,   word: 'the',      type: 'word',  gloss: 'artigo definido — o, a, os, as',                          example: 'The book is on the table.' },
  { rank: 2,   word: 'be',       type: 'word',  gloss: 'ser ou estar (verbo auxiliar)',                            example: 'She will be here soon.' },
  { rank: 3,   word: 'to',       type: 'word',  gloss: 'para; partícula de infinitivo',                            example: 'I want to learn English.' },
  { rank: 4,   word: 'of',       type: 'word',  gloss: 'de (preposição de posse/relação)',                         example: 'A cup of coffee.' },
  { rank: 5,   word: 'and',      type: 'word',  gloss: 'e (conjunção aditiva)',                                    example: 'cats and dogs' },
  { rank: 6,   word: 'a',        type: 'word',  gloss: 'artigo indefinido — um, uma',                              example: 'I saw a dog.' },
  { rank: 7,   word: 'in',       type: 'word',  gloss: 'em, dentro de (preposição de lugar/tempo)',                example: 'She lives in Brazil.' },
  { rank: 8,   word: 'that',     type: 'word',  gloss: 'que; esse/essa; aquele/aquela',                            example: 'I think that it\'s true.' },
  { rank: 9,   word: 'have',     type: 'word',  gloss: 'ter; possuir; auxiliar de perfeito',                       example: 'I have finished my work.' },
  { rank: 10,  word: 'it',       type: 'word',  gloss: 'pronome neutro — isso, ele, ela (objetos/ideias)',         example: 'It is raining.' },
  { rank: 11,  word: 'for',      type: 'word',  gloss: 'para; por; durante (preposição)',                          example: 'I\'ve been here for two hours.' },
  { rank: 12,  word: 'not',      type: 'word',  gloss: 'não (negação)',                                            example: 'I do not agree.' },
  { rank: 13,  word: 'on',       type: 'word',  gloss: 'sobre, em cima de; em (preposição)',                       example: 'Put it on the table.' },
  { rank: 14,  word: 'with',     type: 'word',  gloss: 'com (preposição de companhia/instrumento)',                example: 'She came with her friend.' },
  { rank: 15,  word: 'he',       type: 'word',  gloss: 'ele (pronome sujeito masculino)',                          example: 'He is my brother.' },
  { rank: 16,  word: 'as',       type: 'word',  gloss: 'como; enquanto; tão…quanto',                               example: 'As a teacher, she inspires many.' },
  { rank: 17,  word: 'you',      type: 'word',  gloss: 'você; vocês (pronome)',                                    example: 'You are doing great.' },
  { rank: 18,  word: 'do',       type: 'word',  gloss: 'fazer; auxiliar de negação/pergunta',                      example: 'Do you speak English?' },
  { rank: 19,  word: 'at',       type: 'word',  gloss: 'em, às (preposição de lugar/hora específica)',             example: 'I\'ll meet you at 5pm.' },
  { rank: 20,  word: 'this',     type: 'word',  gloss: 'este, esta, isso (demonstrativo próximo)',                 example: 'This is my favorite book.' },
  { rank: 21,  word: 'but',      type: 'word',  gloss: 'mas, porém (conjunção adversativa)',                       example: 'I tried, but I failed.' },
  { rank: 22,  word: 'his',      type: 'word',  gloss: 'dele, seu/sua (possessivo masculino)',                     example: 'That\'s his car.' },
  { rank: 23,  word: 'by',       type: 'word',  gloss: 'por; ao lado de; até (preposição)',                        example: 'The book was written by her.' },
  { rank: 24,  word: 'from',     type: 'word',  gloss: 'de; desde; a partir de (preposição de origem)',            example: 'She\'s from Japan.' },
  { rank: 25,  word: 'they',     type: 'word',  gloss: 'eles, elas (pronome plural)',                              example: 'They are coming tomorrow.' },
  { rank: 26,  word: 'we',       type: 'word',  gloss: 'nós (pronome)',                                            example: 'We should talk.' },
  { rank: 27,  word: 'say',      type: 'word',  gloss: 'dizer, falar',                                             example: 'What did you say?' },
  { rank: 28,  word: 'her',      type: 'word',  gloss: 'ela (objeto); dela (possessivo feminino)',                  example: 'I called her yesterday.' },
  { rank: 29,  word: 'she',      type: 'word',  gloss: 'ela (pronome sujeito feminino)',                            example: 'She knows the answer.' },
  { rank: 30,  word: 'or',       type: 'word',  gloss: 'ou (conjunção alternativa)',                               example: 'Coffee or tea?' },
  { rank: 31,  word: 'an',       type: 'word',  gloss: 'artigo indefinido antes de vogal — um, uma',              example: 'I have an idea.' },
  { rank: 32,  word: 'will',     type: 'word',  gloss: 'auxiliar de futuro; vontade',                              example: 'I will call you later.' },
  { rank: 33,  word: 'my',       type: 'word',  gloss: 'meu, minha (possessivo)',                                  example: 'My name is Ana.' },
  { rank: 34,  word: 'one',      type: 'word',  gloss: 'um (numeral); alguém (pronome genérico)',                  example: 'One must be careful.' },
  { rank: 35,  word: 'all',      type: 'word',  gloss: 'todo, todos, tudo',                                        example: 'All the students passed.' },
  { rank: 36,  word: 'would',    type: 'word',  gloss: 'auxiliar condicional/passado de will',                     example: 'I would love to come.' },
  { rank: 37,  word: 'there',    type: 'word',  gloss: 'lá; há/existe (there is/are)',                             example: 'There is a problem.' },
  { rank: 38,  word: 'their',    type: 'word',  gloss: 'deles, delas (possessivo plural)',                         example: 'Their house is big.' },
  { rank: 39,  word: 'what',     type: 'word',  gloss: 'o que; que (interrogativo/relativo)',                      example: 'What do you mean?' },
  { rank: 40,  word: 'so',       type: 'word',  gloss: 'então; tão; portanto',                                     example: 'So, what happened?' },
  { rank: 41,  word: 'up',       type: 'word',  gloss: 'para cima; completamente (partícula verbal)',              example: 'Pick it up.' },
  { rank: 42,  word: 'out',      type: 'word',  gloss: 'para fora; fora (partícula/adv)',                          example: 'Get out of here.' },
  { rank: 43,  word: 'if',       type: 'word',  gloss: 'se (conjunção condicional)',                               example: 'If you need help, call me.' },
  { rank: 44,  word: 'about',    type: 'word',  gloss: 'sobre; acerca de; mais ou menos',                          example: 'Tell me about yourself.' },
  { rank: 45,  word: 'who',      type: 'word',  gloss: 'quem (interrogativo/relativo)',                             example: 'Who are you?' },
  { rank: 46,  word: 'get',      type: 'word',  gloss: 'pegar; obter; ficar; entender',                            example: 'I get what you mean.' },
  { rank: 47,  word: 'which',    type: 'word',  gloss: 'qual; que; o qual (relativo)',                              example: 'Which one do you prefer?' },
  { rank: 48,  word: 'go',       type: 'word',  gloss: 'ir; funcionar; acontecer',                                 example: 'Let\'s go!' },
  { rank: 49,  word: 'me',       type: 'word',  gloss: 'me, mim (pronome objeto)',                                  example: 'Call me.' },
  { rank: 50,  word: 'when',     type: 'word',  gloss: 'quando (interrogativo/conjunção)',                          example: 'When does it start?' },
  // Continuar de rank 51 até 500 seguindo o mesmo padrão.
];

export const CONNECTED_SPEECH: ConnectedSpeechItem[] = [
  // Linking — consoante final liga à vogal inicial da próxima palavra
  { phenomenon: 'linking', full: 'pick it up',    connected: 'pickitup',    phon: '/ˈpɪk.ɪ.dʌp/',    example: 'Can you pick it up?',         tip: 'O /k/ de "pick" liga ao /ɪ/ de "it" — sem pausa entre as palavras' },
  { phenomenon: 'linking', full: 'turn it off',   connected: 'turnit off',  phon: '/ˈtɜː.nɪ.dɒf/',   example: 'Turn it off, please.',        tip: 'O /n/ de "turn" e o /ɪ/ de "it" se fundem em uma sílaba só' },
  { phenomenon: 'linking', full: 'an apple',      connected: 'an napple',   phon: '/ə.ˈnæp.əl/',     example: 'I want an apple.',            tip: '"an" antes de vogal: o /n/ vira onset da sílaba seguinte' },
  { phenomenon: 'linking', full: 'not at all',    connected: 'notatall',    phon: '/ˌnɒ.tə.ˈtɔːl/',  example: 'Not at all, no worries.',     tip: 'Três palavras viram um bloco fonético contínuo' },

  // Intrusion — som "fantasma" aparece entre vogais
  { phenomenon: 'intrusion', full: 'the idea of',  connected: 'the idear of', phon: '/ðə.aɪ.ˈdɪər.əv/', example: 'The idea of it scares me.',   tip: '/r/ intrusivo entre vogal e outra vogal (comum no inglês britânico)' },
  { phenomenon: 'intrusion', full: 'go out',        connected: 'gow out',      phon: '/ˈɡəʊ.waʊt/',     example: "Let's go out tonight.",      tip: '/w/ aparece entre vogal arredondada /əʊ/ e outra vogal' },
  { phenomenon: 'intrusion', full: 'I asked',       connected: 'I yasked',     phon: '/aɪ.ˈjɑːskt/',    example: 'I asked her directly.',       tip: '/j/ intrusivo conecta /aɪ/ à vogal de "asked"' },

  // Assimilation — um som muda por influência do vizinho
  { phenomenon: 'assimilation', full: 'did you',    connected: 'didja',       phon: '/ˈdɪ.dʒə/',       example: 'Did you see that?',           tip: '/d/ + /j/ → /dʒ/ (como em "jeans"). Acontece automaticamente na fala rápida' },
  { phenomenon: 'assimilation', full: 'would you',  connected: 'wouldja',     phon: '/ˈwʊ.dʒə/',       example: 'Would you like some?',        tip: '/d/ + /j/ → /dʒ/ sempre que "you" segue uma palavra com /d/ final' },
  { phenomenon: 'assimilation', full: 'what do you',connected: 'whaddaya',    phon: '/ˈwɒ.də.jə/',     example: 'What do you think?',          tip: 'Tripla redução: "what+do+you" fundidos em um único bloco' },
  { phenomenon: 'assimilation', full: 'meet you',   connected: 'meetcha',     phon: '/ˈmiː.tʃə/',      example: 'Nice to meet you!',           tip: '/t/ + /j/ → /tʃ/ (como em "cheese"). Clássico "nice to meetcha"' },

  // Elision — som desaparece completamente
  { phenomenon: 'elision', full: 'next day',    connected: 'nex\u200Bday',  phon: '/ˈnɛks.deɪ/',      example: 'See you next day.',          tip: 'O /t/ some antes de consoante. "next" → /nɛks/' },
  { phenomenon: 'elision', full: 'last time',   connected: 'las\u200Btime', phon: '/ˈlæs.taɪm/',      example: 'Last time I was here...',    tip: 'O /t/ de "last" não é pronunciado antes de outro /t/' },
  { phenomenon: 'elision', full: 'mostly',      connected: 'mosly',         phon: '/ˈməʊs.li/',        example: "It's mostly fine.",          tip: 'O /t/ interno some em grupos consonantais /stl/' },
  { phenomenon: 'elision', full: 'facts',       connected: 'facs',          phon: '/fæks/',            example: 'Just the facts.',            tip: 'Em clusters como /kts/, o /t/ médio desaparece' },
];

export const SCHWA_WORDS: SchwaWord[] = [
  { word:'banana', ipa:'/bəˈnænə/', schwas:[0,2] },
  { word:'about', ipa:'/əˈbaʊt/', schwas:[0] },
  { word:'problem', ipa:'/ˈprɒbləm/', schwas:[1] },
  { word:'family', ipa:'/ˈfæməli/', schwas:[1] },
  { word:'comfortable', ipa:'/ˈkʌmftəbəl/', schwas:[1,2] },
];

export const REDUCTIONS: Reduction[] = [
  { full:'want to', reduced:'wanna', phon:'/ˈwɒn.ə/' },
  { full:'going to', reduced:'gonna', phon:'/ˈɡʌn.ə/' },
  { full:'got to', reduced:'gotta', phon:'/ˈɡɒt.ə/' },
  { full:'kind of', reduced:'kinda', phon:'/ˈkaɪn.də/' },
  { full:'out of', reduced:'outta', phon:'/ˈaʊ.də/' },
  { full:'let me', reduced:'lemme', phon:'/ˈlɛm.i/' },
];

export type Profile = {
  name: string;
  level: string;
  cefrPct: number;
  streak: number;
  bestStreak: number;
  totalWords: number;
  matureWords: number;
  zipfCoverage: number;
  weeklyMinutes: number[];
  pillars: { name: string; pct: number; c: string }[];
};

export const PROFILE: Profile = {
  name: 'Diego',
  level: 'B1+',
  cefrPct: 64,
  streak: 23,
  bestStreak: 41,
  totalWords: 1247,
  matureWords: 892,
  zipfCoverage: 73,
  weeklyMinutes: [22, 35, 18, 42, 28, 51, 38],
  pillars: [
    { name:'Vocabulary', pct:78, c:'#2D5A3D' },
    { name:'Pronunciation', pct:54, c:'#3D7B8C' },
    { name:'Listening', pct:71, c:'#D4A24C' },
    { name:'Collocations', pct:48, c:'#E8704C' },
  ],
};

export const NEWS_ARTICLES: NewsArticle[] = [
  // ── LEVEL 1 (A2) ──────────────────────────────────────────────────────────
  {
    id: 'news-l1-01',
    title: 'A New School Opens in the City',
    level: 1,
    topic: 'Education',
    date: '2026-04-20',
    text: 'A new school opened in the city last week. The school has 500 students. The students are happy. The teachers are happy too. The school has new computers and a big library. Parents say it is a great place to learn.',
    vocabulary: [
      { term: 'opened', type: 'word', gloss: 'abriu (passado de open)', example: 'The new school opened last week.', source: 'News · Level 1' },
      { term: 'library', type: 'word', gloss: 'biblioteca', example: 'The school has a big library.', source: 'News · Level 1' },
      { term: 'parents', type: 'word', gloss: 'pais (pai e mãe)', example: 'Parents say it is a great place.', source: 'News · Level 1' },
      { term: 'great place to learn', type: 'phrase', gloss: 'ótimo lugar para aprender', example: 'It is a great place to learn.', source: 'News · Level 1' },
    ],
  },
  {
    id: 'news-l1-02',
    title: 'Scientists Find Water on Mars',
    level: 1,
    topic: 'Science',
    date: '2026-04-15',
    text: 'Scientists say they found water on Mars. The water is under the ground. It is very cold there. Mars is far from Earth. People cannot live on Mars now. But scientists want to learn more about it.',
    vocabulary: [
      { term: 'scientists', type: 'word', gloss: 'cientistas', example: 'Scientists found water on Mars.', source: 'News · Level 1' },
      { term: 'under the ground', type: 'phrase', gloss: 'embaixo da terra / subterrâneo', example: 'The water is under the ground.', source: 'News · Level 1' },
      { term: 'far from', type: 'collocation', gloss: 'longe de', example: 'Mars is far from Earth.', source: 'News · Level 1' },
      { term: 'learn more about', type: 'chunk', gloss: 'aprender mais sobre', example: 'Scientists want to learn more about it.', source: 'News · Level 1', function: 'clarifying' },
    ],
  },
  {
    id: 'news-l1-03',
    title: 'Dogs Help People Feel Better',
    level: 1,
    topic: 'Health',
    date: '2026-04-10',
    text: 'A new study says dogs help people feel better. When you are sad, a dog can make you happy. Doctors say people with dogs are healthier. Dogs are good for your heart. Many hospitals now have dogs for patients.',
    vocabulary: [
      { term: 'study', type: 'word', gloss: 'estudo (pesquisa científica)', example: 'A new study says dogs help people.', source: 'News · Level 1' },
      { term: 'feel better', type: 'phrase', gloss: 'sentir-se melhor', example: 'Dogs help people feel better.', source: 'News · Level 1' },
      { term: 'healthier', type: 'word', gloss: 'mais saudável (comparativo de healthy)', example: 'People with dogs are healthier.', source: 'News · Level 1' },
      { term: 'patients', type: 'word', gloss: 'pacientes (hospital)', example: 'Hospitals have dogs for patients.', source: 'News · Level 1' },
    ],
  },
  // ── LEVEL 2 (B1) ──────────────────────────────────────────────────────────
  {
    id: 'news-l2-01',
    title: 'Teenagers Spend Too Much Time on Phones',
    level: 2,
    topic: 'Technology',
    date: '2026-04-18',
    text: 'A recent survey found that teenagers spend an average of seven hours a day on their smartphones. Experts are concerned about the impact on mental health and sleep quality. Some schools have introduced phone bans during lessons, which has led to improved concentration and better academic results.',
    vocabulary: [
      { term: 'survey', type: 'word', gloss: 'pesquisa/enquete (coleta de dados)', example: 'A recent survey found that teenagers...', source: 'News · Level 2' },
      { term: 'are concerned about', type: 'chunk', gloss: 'estão preocupados com', example: 'Experts are concerned about the impact.', source: 'News · Level 2', function: 'reacting' },
      { term: 'phone ban', type: 'collocation', gloss: 'proibição de celulares', example: 'Some schools introduced phone bans.', source: 'News · Level 2' },
      { term: 'led to', type: 'phrase', gloss: 'resultou em / levou a', example: 'The ban led to improved concentration.', source: 'News · Level 2' },
      { term: 'academic results', type: 'collocation', gloss: 'resultados acadêmicos / desempenho escolar', example: 'Students showed better academic results.', source: 'News · Level 2' },
    ],
  },
  {
    id: 'news-l2-02',
    title: 'Electric Cars Are Becoming More Popular',
    level: 2,
    topic: 'Technology',
    date: '2026-04-12',
    text: 'Sales of electric vehicles have increased by 35% this year, according to industry data. Many governments are offering tax incentives to encourage people to switch from petrol cars. However, critics point out that charging infrastructure is still insufficient in rural areas, making the transition challenging for many drivers.',
    vocabulary: [
      { term: 'tax incentives', type: 'collocation', gloss: 'incentivos fiscais / benefícios tributários', example: 'Governments offer tax incentives.', source: 'News · Level 2' },
      { term: 'charging infrastructure', type: 'collocation', gloss: 'infraestrutura de recarga (elétrica)', example: 'Charging infrastructure is insufficient.', source: 'News · Level 2' },
      { term: 'point out', type: 'phrase', gloss: 'apontar / ressaltar', example: 'Critics point out the challenges.', source: 'News · Level 2' },
      { term: 'rural areas', type: 'collocation', gloss: 'áreas rurais / interior', example: 'Infrastructure is lacking in rural areas.', source: 'News · Level 2' },
      { term: 'make the transition', type: 'chunk', gloss: 'fazer a transição', example: 'The transition is challenging for drivers.', source: 'News · Level 2', function: 'transitioning' },
    ],
  },
  {
    id: 'news-l2-03',
    title: 'Coffee Prices Hit Record High',
    level: 2,
    topic: 'World',
    date: '2026-04-08',
    text: 'Global coffee prices have reached their highest level in 50 years due to poor harvests in Brazil and Vietnam, which together account for over half of the world\'s supply. Retailers are warning consumers to expect higher prices at cafés and supermarkets. Some economists believe prices could remain elevated for at least two years.',
    vocabulary: [
      { term: 'hit a record high', type: 'phrase', gloss: 'atingir um recorde histórico', example: 'Coffee prices hit a record high.', source: 'News · Level 2' },
      { term: 'poor harvest', type: 'collocation', gloss: 'safra ruim / colheita fraca', example: 'Poor harvests caused price increases.', source: 'News · Level 2' },
      { term: 'account for', type: 'phrase', gloss: 'representar / corresponder a (porcentagem/parte)', example: 'They account for half of the supply.', source: 'News · Level 2' },
      { term: 'elevated', type: 'word', gloss: 'elevado / alto (formal)', example: 'Prices could remain elevated.', source: 'News · Level 2' },
      { term: 'at least', type: 'phrase', gloss: 'pelo menos / no mínimo', example: 'For at least two years.', source: 'News · Level 2' },
    ],
  },
  // ── LEVEL 3 (B2) ──────────────────────────────────────────────────────────
  {
    id: 'news-l3-01',
    title: 'Artificial Intelligence Reshaping the Job Market',
    level: 3,
    topic: 'Technology',
    date: '2026-04-22',
    text: 'A landmark report by the World Economic Forum predicts that AI and automation will displace 85 million jobs globally by 2025, while simultaneously creating 97 million new roles. The disparity lies in skills: routine cognitive tasks are increasingly vulnerable to automation, whereas positions requiring emotional intelligence, creative problem-solving, and complex human interaction are proving more resilient. Critics argue the transition will disproportionately affect lower-income workers who lack access to retraining programmes.',
    vocabulary: [
      { term: 'landmark report', type: 'collocation', gloss: 'relatório histórico / estudo marcante', example: 'A landmark report predicts major changes.', source: 'News · Level 3' },
      { term: 'displace', type: 'word', gloss: 'deslocar / substituir (empregos)', example: 'AI will displace millions of jobs.', source: 'News · Level 3' },
      { term: 'simultaneously', type: 'word', gloss: 'simultaneamente / ao mesmo tempo', example: 'Jobs are lost and created simultaneously.', source: 'News · Level 3' },
      { term: 'vulnerable to', type: 'collocation', gloss: 'vulnerável a / suscetível a', example: 'Routine tasks are vulnerable to automation.', source: 'News · Level 3' },
      { term: 'disproportionately affect', type: 'collocation', gloss: 'afetar desproporcionalmente', example: 'Changes disproportionately affect low-income workers.', source: 'News · Level 3' },
      { term: 'retraining programmes', type: 'collocation', gloss: 'programas de requalificação profissional', example: 'Workers lack access to retraining programmes.', source: 'News · Level 3' },
    ],
  },
  {
    id: 'news-l3-02',
    title: 'Microplastics Found in Human Blood',
    level: 3,
    topic: 'Health',
    date: '2026-04-14',
    text: 'Researchers have detected microplastics in human blood for the first time, raising profound concerns about long-term health implications. The study, published in Environment International, analysed samples from 22 anonymous donors and found plastic particles in 77% of them. While the full ramifications remain unclear, preliminary evidence suggests microplastics may trigger inflammatory responses and accumulate in organs over time. Scientists are calling for urgent regulatory action to curb plastic pollution at its source.',
    vocabulary: [
      { term: 'profound concerns', type: 'collocation', gloss: 'preocupações profundas / sérias inquietações', example: 'The findings raise profound concerns.', source: 'News · Level 3' },
      { term: 'ramifications', type: 'word', gloss: 'ramificações / consequências (formal)', example: 'The full ramifications remain unclear.', source: 'News · Level 3' },
      { term: 'trigger', type: 'word', gloss: 'desencadear / disparar (um processo)', example: 'Microplastics may trigger inflammation.', source: 'News · Level 3' },
      { term: 'accumulate', type: 'word', gloss: 'acumular-se / se depositar ao longo do tempo', example: 'Plastics accumulate in organs.', source: 'News · Level 3' },
      { term: 'curb', type: 'word', gloss: 'conter / frear / limitar (formal)', example: 'Scientists call to curb plastic pollution.', source: 'News · Level 3' },
      { term: 'calling for', type: 'chunk', gloss: 'reivindicando / pedindo / exigindo (ação)', example: 'Scientists are calling for urgent action.', source: 'News · Level 3', function: 'emphasizing' },
    ],
  },
  {
    id: 'news-l3-03',
    title: 'Remote Work Permanently Reshaping Urban Planning',
    level: 3,
    topic: 'World',
    date: '2026-04-05',
    text: 'The sustained shift towards remote and hybrid work arrangements is fundamentally altering the dynamics of urban centres. Once-thriving business districts are grappling with persistently high office vacancy rates, prompting city authorities to explore adaptive reuse strategies — converting commercial spaces into residential units and mixed-use developments. Economists warn this structural transformation could erode municipal tax revenues, while urban planners see an opportunity to create more liveable, people-centred cities.',
    vocabulary: [
      { term: 'grappling with', type: 'chunk', gloss: 'lidando com / enfrentando (desafio persistente)', example: 'Districts are grappling with high vacancy.', source: 'News · Level 3', function: 'storytelling' },
      { term: 'adaptive reuse', type: 'collocation', gloss: 'reuso adaptativo (converter edifícios para novos usos)', example: 'Cities explore adaptive reuse strategies.', source: 'News · Level 3' },
      { term: 'erode', type: 'word', gloss: 'erodir / desgastar / reduzir gradualmente', example: 'Changes could erode tax revenues.', source: 'News · Level 3' },
      { term: 'municipal', type: 'word', gloss: 'municipal / da prefeitura', example: 'Municipal tax revenues could fall.', source: 'News · Level 3' },
      { term: 'people-centred', type: 'collocation', gloss: 'centrado nas pessoas / humanizado', example: 'Creating more people-centred cities.', source: 'News · Level 3' },
      { term: 'vacancy rate', type: 'collocation', gloss: 'taxa de vacância / ocupação vaga', example: 'High office vacancy rates persist.', source: 'News · Level 3' },
    ],
  },
];

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  // ── LEVEL 1 (A1/A2) ──────────────────────────────────────────────────────────
  { id: 'g1-1',  level: 'A1', lessonNumber: 1,  minWords: 500, title: 'To be', description: 'Estudo sobre o verbo To be', url: 'https://www.grammarinlevels.com/level1/lesson-1/', difficultyTags: ['basic', 'verbs'] },
  { id: 'g1-2',  level: 'A1', lessonNumber: 2,  minWords: 500, title: 'Present simple', description: 'Prática de Present Simple', url: 'https://www.grammarinlevels.com/level1/lesson-2/', difficultyTags: ['basic', 'tenses'] },
  { id: 'g1-3',  level: 'A1', lessonNumber: 3,  minWords: 500, title: 'Can', description: 'Uso do verbo modal Can', url: 'https://www.grammarinlevels.com/level1/lesson-3/', difficultyTags: ['modal', 'ability'] },
  { id: 'g1-4',  level: 'A1', lessonNumber: 4,  minWords: 500, title: 'Plural', description: 'Regras de plural em inglês', url: 'https://www.grammarinlevels.com/level1/lesson-4/', difficultyTags: ['nouns', 'grammar'] },
  { id: 'g1-5',  level: 'A1', lessonNumber: 5,  minWords: 500, title: 'A, the', description: 'Artigos definidos e indefinidos', url: 'https://www.grammarinlevels.com/level1/lesson-5/', difficultyTags: ['articles', 'grammar'] },
  { id: 'g1-6',  level: 'A1', lessonNumber: 6,  minWords: 500, title: 'To go', description: 'Uso do verbo To go', url: 'https://www.grammarinlevels.com/level1/lesson-6/', difficultyTags: ['verbs', 'common'] },
  { id: 'g1-7',  level: 'A1', lessonNumber: 7,  minWords: 500, title: 'Present continuous', description: 'Estudo do Present Continuous', url: 'https://www.grammarinlevels.com/level1/lesson-7/', difficultyTags: ['tenses', 'ongoing'] },
  { id: 'g1-8',  level: 'A1', lessonNumber: 8,  minWords: 500, title: 'Me', description: 'Pronomes objeto', url: 'https://www.grammarinlevels.com/level1/lesson-8/', difficultyTags: ['pronouns', 'grammar'] },
  { id: 'g1-9',  level: 'A1', lessonNumber: 9,  minWords: 500, title: 'Go', description: 'Verbo Go e direções', url: 'https://www.grammarinlevels.com/level1/lesson-9/', difficultyTags: ['verbs', 'directions'] },
  { id: 'g1-10', level: 'A1', lessonNumber: 10, minWords: 500, title: 'Must', description: 'Verbo modal Must', url: 'https://www.grammarinlevels.com/level1/lesson-10/', difficultyTags: ['modal', 'obligation'] },
  { id: 'g1-11', level: 'A2', lessonNumber: 11, minWords: 500, title: 'Faster', description: 'Comparativos de superioridade', url: 'https://www.grammarinlevels.com/level1/lesson-11/', difficultyTags: ['comparatives', 'adjectives'] },
  { id: 'g1-12', level: 'A2', lessonNumber: 12, minWords: 500, title: 'There is', description: 'Haver/existir com There is/are', url: 'https://www.grammarinlevels.com/level1/lesson-12/', difficultyTags: ['existence', 'grammar'] },
  { id: 'g1-13', level: 'A2', lessonNumber: 13, minWords: 500, title: 'Fastest', description: 'Superlativos', url: 'https://www.grammarinlevels.com/level1/lesson-13/', difficultyTags: ['superlatives', 'adjectives'] },
  { id: 'g1-14', level: 'A2', lessonNumber: 14, minWords: 500, title: 'Negative sentence', description: 'Estrutura de frases negativas', url: 'https://www.grammarinlevels.com/level1/lesson-14/', difficultyTags: ['syntax', 'negative'] },
  { id: 'g1-15', level: 'A2', lessonNumber: 15, minWords: 500, title: 'Nobody', description: 'Pronomes indefinidos negativos', url: 'https://www.grammarinlevels.com/level1/lesson-15/', difficultyTags: ['pronouns', 'negation'] },
  { id: 'g1-16', level: 'A2', lessonNumber: 16, minWords: 500, title: 'Question', description: 'Formação de perguntas', url: 'https://www.grammarinlevels.com/level1/lesson-16/', difficultyTags: ['syntax', 'questions'] },
  { id: 'g1-17', level: 'A2', lessonNumber: 17, minWords: 500, title: 'Many, much', description: 'Quantificadores Many e Much', url: 'https://www.grammarinlevels.com/level1/lesson-17/', difficultyTags: ['quantifiers', 'countable'] },
  { id: 'g1-18', level: 'A2', lessonNumber: 18, minWords: 500, title: 'Somebody’s', description: "Caso possessivo ('s)", url: 'https://www.grammarinlevels.com/level1/lesson-18/', difficultyTags: ['possessive', 'grammar'] },
  { id: 'g1-19', level: 'A2', lessonNumber: 19, minWords: 500, title: 'I’m', description: 'Contrações comuns', url: 'https://www.grammarinlevels.com/level1/lesson-19/', difficultyTags: ['contractions', 'pronunciation'] },
  { id: 'g1-20', level: 'A2', lessonNumber: 20, minWords: 500, title: 'In, on, at', description: 'Preposições de tempo e lugar', url: 'https://www.grammarinlevels.com/level1/lesson-20/', difficultyTags: ['prepositions', 'time', 'place'] },
  { id: 'g1-21', level: 'A2', lessonNumber: 21, minWords: 500, title: 'In, on, at, for', description: 'Preposições avançadas de tempo', url: 'https://www.grammarinlevels.com/level1/lesson-21/', difficultyTags: ['prepositions', 'time'] },

  // ── LEVEL 2 (B1/B2) ──────────────────────────────────────────────────────────
  { id: 'g2-1',  level: 'B1', lessonNumber: 1,  minWords: 1000, title: 'I was', description: 'Passado do verbo To be', url: 'https://www.grammarinlevels.com/level2/lesson-1/', difficultyTags: ['past', 'verbs'] },
  { id: 'g2-2',  level: 'B1', lessonNumber: 2,  minWords: 1000, title: 'Past simple', description: 'Estudo do Past Simple', url: 'https://www.grammarinlevels.com/level2/lesson-2/', difficultyTags: ['past', 'tenses'] },
  { id: 'g2-3',  level: 'B1', lessonNumber: 3,  minWords: 1000, title: 'Could', description: 'Uso do modal Could', url: 'https://www.grammarinlevels.com/level2/lesson-3/', difficultyTags: ['modal', 'past-ability'] },
  { id: 'g2-4',  level: 'B1', lessonNumber: 4,  minWords: 1000, title: 'Had to', description: 'Expressando obrigação no passado', url: 'https://www.grammarinlevels.com/level2/lesson-4/', difficultyTags: ['past', 'obligation'] },
  { id: 'g2-5',  level: 'B1', lessonNumber: 5,  minWords: 1000, title: 'Future simple', description: 'Uso de Will para o futuro', url: 'https://www.grammarinlevels.com/level2/lesson-5/', difficultyTags: ['future', 'tenses'] },
  { id: 'g2-6',  level: 'B1', lessonNumber: 6,  minWords: 1000, title: 'Past continuous', description: 'Estudo do Past Continuous', url: 'https://www.grammarinlevels.com/level2/lesson-6/', difficultyTags: ['past', 'ongoing'] },
  { id: 'g2-7',  level: 'B1', lessonNumber: 7,  minWords: 1000, title: 'Some, any', description: 'Quantificadores Some e Any', url: 'https://www.grammarinlevels.com/level2/lesson-7/', difficultyTags: ['quantifiers', 'indefinite'] },
  { id: 'g2-8',  level: 'B1', lessonNumber: 8,  minWords: 1000, title: 'Would like', description: 'Expressando desejos com Would like', url: 'https://www.grammarinlevels.com/level2/lesson-8/', difficultyTags: ['desires', 'politeness'] },
  { id: 'g2-9',  level: 'B1', lessonNumber: 9,  minWords: 1000, title: 'Passive', description: 'Introdução à Voz Passiva', url: 'https://www.grammarinlevels.com/level2/lesson-9/', difficultyTags: ['passive-voice', 'syntax'] },
  { id: 'g2-10', level: 'B1', lessonNumber: 10, minWords: 1000, title: 'Playing', description: 'Uso de Gerúndio (-ing)', url: 'https://www.grammarinlevels.com/level2/lesson-10/', difficultyTags: ['gerund', 'verbs'] },
  { id: 'g2-11', level: 'B2', lessonNumber: 11, minWords: 1000, title: 'Myself', description: 'Pronomes reflexivos', url: 'https://www.grammarinlevels.com/level2/lesson-11/', difficultyTags: ['pronouns', 'reflexive'] },
  { id: 'g2-12', level: 'B2', lessonNumber: 12, minWords: 1000, title: 'There was', description: 'Haver/existir no passado', url: 'https://www.grammarinlevels.com/level2/lesson-12/', difficultyTags: ['past', 'existence'] },
  { id: 'g2-13', level: 'B2', lessonNumber: 13, minWords: 1000, title: 'Who, which', description: 'Pronomes relativos básicos', url: 'https://www.grammarinlevels.com/level2/lesson-13/', difficultyTags: ['relative-pronouns', 'syntax'] },
  { id: 'g2-14', level: 'B2', lessonNumber: 14, minWords: 1000, title: 'Negative sentence', description: 'Negação avançada', url: 'https://www.grammarinlevels.com/level2/lesson-14/', difficultyTags: ['syntax', 'negative'] },
  { id: 'g2-15', level: 'B2', lessonNumber: 15, minWords: 1000, title: 'Question', description: 'Perguntas complexas', url: 'https://www.grammarinlevels.com/level2/lesson-15/', difficultyTags: ['syntax', 'questions'] },
  { id: 'g2-16', level: 'B2', lessonNumber: 16, minWords: 1000, title: 'Phrasal verbs', description: 'Introdução a Phrasal Verbs', url: 'https://www.grammarinlevels.com/level2/lesson-16/', difficultyTags: ['phrasal-verbs', 'vocabulary'] },
  { id: 'g2-17', level: 'B2', lessonNumber: 17, minWords: 1000, title: 'Have got', description: 'Uso de Have got', url: 'https://www.grammarinlevels.com/level2/lesson-17/', difficultyTags: ['possession', 'british'] },
  { id: 'g2-18', level: 'B2', lessonNumber: 18, minWords: 1000, title: 'If, when', description: 'First Conditional e conjunções', url: 'https://www.grammarinlevels.com/level2/lesson-18/', difficultyTags: ['conditionals', 'conjunctions'] },
  { id: 'g2-19', level: 'B2', lessonNumber: 19, minWords: 1000, title: 'Who likes you?', description: 'Subject Questions', url: 'https://www.grammarinlevels.com/level2/lesson-19/', difficultyTags: ['syntax', 'questions'] },
  { id: 'g2-20', level: 'B2', lessonNumber: 20, minWords: 1000, title: 'Get better', description: 'Uso de Get como tornar-se', url: 'https://www.grammarinlevels.com/level2/lesson-20/', difficultyTags: ['verbs', 'change'] },
  { id: 'g2-21', level: 'B2', lessonNumber: 21, minWords: 1000, title: 'This one', description: 'Pronomes demonstrativos e determinantes', url: 'https://www.grammarinlevels.com/level2/lesson-21/', difficultyTags: ['pronouns', 'determiners'] },

  // ── LEVEL 3 (C1/C2) ──────────────────────────────────────────────────────────
  { id: 'g3-1',  level: 'C1', lessonNumber: 1,  minWords: 2000, title: 'Going to', description: 'Futuro com Going to', url: 'https://www.grammarinlevels.com/level3/lesson-1/', difficultyTags: ['future', 'intentions'] },
  { id: 'g3-2',  level: 'C1', lessonNumber: 2,  minWords: 2000, title: 'Could, should, would', description: 'Modais no presente e futuro', url: 'https://www.grammarinlevels.com/level3/lesson-2/', difficultyTags: ['modals', 'advice', 'possibility'] },
  { id: 'g3-3',  level: 'C1', lessonNumber: 3,  minWords: 2000, title: 'Present perfect', description: 'Estudo do Present Perfect', url: 'https://www.grammarinlevels.com/level3/lesson-3/', difficultyTags: ['tenses', 'perfect'] },
  { id: 'g3-4',  level: 'C1', lessonNumber: 4,  minWords: 2000, title: 'Present perfect continuous', description: 'Estudo do Present Perfect Continuous', url: 'https://www.grammarinlevels.com/level3/lesson-4/', difficultyTags: ['tenses', 'perfect-continuous'] },
  { id: 'g3-5',  level: 'C1', lessonNumber: 5,  minWords: 2000, title: 'Past perfect', description: 'Estudo do Past Perfect', url: 'https://www.grammarinlevels.com/level3/lesson-5/', difficultyTags: ['tenses', 'past-perfect'] },
  { id: 'g3-6',  level: 'C1', lessonNumber: 6,  minWords: 2000, title: 'I want you to win', description: 'Estrutura Verbo + Objeto + Infinitivo', url: 'https://www.grammarinlevels.com/level3/lesson-6/', difficultyTags: ['syntax', 'verb-patterns'] },
  { id: 'g3-7',  level: 'C1', lessonNumber: 7,  minWords: 2000, title: 'Gonna, wanna, gotta', description: 'Reduções informais na fala', url: 'https://www.grammarinlevels.com/level3/lesson-7/', difficultyTags: ['informal', 'reductions', 'speaking'] },
  { id: 'g3-8',  level: 'C1', lessonNumber: 8,  minWords: 2000, title: 'Let, make, help', description: 'Causative Verbs', url: 'https://www.grammarinlevels.com/level3/lesson-8/', difficultyTags: ['verbs', 'causative'] },
  { id: 'g3-9',  level: 'C1', lessonNumber: 9,  minWords: 2000, title: 'May, might, mustn’t', description: 'Modais de possibilidade e proibição', url: 'https://www.grammarinlevels.com/level3/lesson-9/', difficultyTags: ['modals', 'possibility', 'prohibition'] },
  { id: 'g3-10', level: 'C1', lessonNumber: 10, minWords: 2000, title: 'Prepositions – place', description: 'Preposições de lugar avançadas', url: 'https://www.grammarinlevels.com/level3/lesson-10/', difficultyTags: ['prepositions', 'place'] },
  { id: 'g3-11', level: 'C2', lessonNumber: 11, minWords: 2000, title: 'Prepositions – time', description: 'Preposições de tempo avançadas', url: 'https://www.grammarinlevels.com/level3/lesson-11/', difficultyTags: ['prepositions', 'time'] },
  { id: 'g3-12', level: 'C2', lessonNumber: 12, minWords: 2000, title: 'Could have done', description: 'Modais no passado (Modal Perfect)', url: 'https://www.grammarinlevels.com/level3/lesson-12/', difficultyTags: ['modal-perfect', 'past-regret'] },
  { id: 'g3-13', level: 'C2', lessonNumber: 13, minWords: 2000, title: 'If', description: 'Second and Third Conditionals', url: 'https://www.grammarinlevels.com/level3/lesson-13/', difficultyTags: ['conditionals', 'hypothetical'] },
  { id: 'g3-14', level: 'C2', lessonNumber: 14, minWords: 2000, title: 'Phrasal verbs', description: 'Phrasal Verbs avançados', url: 'https://www.grammarinlevels.com/level3/lesson-14/', difficultyTags: ['phrasal-verbs', 'vocabulary'] },
  { id: 'g3-15', level: 'C2', lessonNumber: 15, minWords: 2000, title: 'I think I know her', description: 'Relative clauses omitidas', url: 'https://www.grammarinlevels.com/level3/lesson-15/', difficultyTags: ['syntax', 'relative-clauses'] },
  { id: 'g3-16', level: 'C2', lessonNumber: 16, minWords: 2000, title: 'Where are you from?', description: 'Preposições no final de perguntas', url: 'https://www.grammarinlevels.com/level3/lesson-16/', difficultyTags: ['syntax', 'questions', 'prepositions'] },
  { id: 'g3-17', level: 'C2', lessonNumber: 17, minWords: 2000, title: 'The woman that I met', description: 'Defining Relative Clauses', url: 'https://www.grammarinlevels.com/level3/lesson-17/', difficultyTags: ['syntax', 'relative-clauses'] },
  { id: 'g3-18', level: 'C2', lessonNumber: 18, minWords: 2000, title: 'I know why she came', description: 'Noun Clauses', url: 'https://www.grammarinlevels.com/level3/lesson-18/', difficultyTags: ['syntax', 'noun-clauses'] },
  { id: 'g3-19', level: 'C2', lessonNumber: 19, minWords: 2000, title: 'Used to', description: 'Hábitos no passado com Used to', url: 'https://www.grammarinlevels.com/level3/lesson-19/', difficultyTags: ['past-habits', 'grammar'] },
  { id: 'g3-20', level: 'C2', lessonNumber: 20, minWords: 2000, title: 'Summary', description: 'Resumo gramatical de nível avançado', url: 'https://www.grammarinlevels.com/level3/lesson-20/', difficultyTags: ['advanced', 'summary'] },
];

