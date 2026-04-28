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
  freq: string;
  known: boolean;
  type: string;
  focus?: boolean;
};

export type SchwaWord = {
  word: string;
  ipa: string;
  schwas: number[];
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
  { id:'c1', kind:'podcast', title:'How to Learn Anything Faster', author:'Andrew Huberman', minutes:42, level:'B2', match:96, art:'#3D7B8C', why:'Vocabulário 92% conhecido · 3 collocations novas', tags:['neuroscience','self-improvement'] },
  { id:'c2', kind:'book', title:'The Pragmatic Thinker', author:'Margaret Yu', minutes:'186 pp', level:'B2', match:91, art:'#2D5A3D', why:'Construído sobre 200 palavras Zipf que você já domina', tags:['non-fiction','essays'] },
  { id:'c3', kind:'video', title:'A Walk Through Edinburgh', author:'Easy English', minutes:18, level:'B1+', match:89, art:'#D4A24C', why:'Sotaque escocês — exposição que falta no seu perfil', tags:['immersion','travel'] },
  { id:'c4', kind:'article', title:'Why we yawn — and why it spreads', author:'The Atlantic', minutes:7, level:'B2', match:94, art:'#E8704C', why:'Tópico de ciência popular · linguagem natural', tags:['science','short-read'] },
  { id:'c5', kind:'podcast', title:'Conversations with Tyler #201', author:'Tyler Cowen', minutes:64, level:'C1', match:78, art:'#6A4E3C', why:'Push level — 14% palavras novas (zona ideal)', tags:['economics','interview'] },
  { id:'c6', kind:'video', title:'Cooking Risotto · slow English', author:'Spoon Fork Bacon', minutes:11, level:'B1', match:92, art:'#A86B3C', why:'Imperativo + culinária = vocabulário do dia a dia', tags:['food','immersion'] },
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

export const ZIPF_WORDS: ZipfWord[] = [
  { rank:1, word:'the', freq:'6.1%', known:true, type:'article' },
  { rank:2, word:'be', freq:'3.9%', known:true, type:'verb' },
  { rank:3, word:'to', freq:'2.7%', known:true, type:'prep' },
  { rank:4, word:'of', freq:'2.6%', known:true, type:'prep' },
  { rank:5, word:'and', freq:'2.4%', known:true, type:'conj' },
  { rank:67, word:'would', freq:'0.34%', known:true, type:'modal' },
  { rank:120, word:'actually', freq:'0.18%', known:true, type:'adv' },
  { rank:312, word:'otherwise', freq:'0.07%', known:false, type:'adv' },
  { rank:489, word:'acknowledge', freq:'0.04%', known:false, type:'verb', focus:true },
  { rank:712, word:'reluctant', freq:'0.026%', known:false, type:'adj' },
  { rank:1043, word:'endeavor', freq:'0.014%', known:false, type:'verb' },
  { rank:1287, word:'plausible', freq:'0.009%', known:false, type:'adj' },
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
